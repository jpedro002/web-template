import fs from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'glob'

const generateRoutes = async (pagesDir, routesFile, excludePatterns = []) => {
	try {
		const routesDir = path.dirname(routesFile)
		await fs.mkdir(routesDir, { recursive: true })
	} catch (error) {
		if (error.code !== 'EEXIST') {
			throw error
		}
	}

	// MODIFICADO: Adicionado '**/loading.jsx' e tsx para ignorar
	const defaultIgnore = [
		'**/_*.jsx',
		'**/_*.tsx',
		'**/layout.jsx',
		'**/error.jsx',
		'**/loading.jsx', // NOVO
		'**/loading.tsx', // NOVO
		'**/__*/**',
	]

	const ignore = [
		...defaultIgnore,
		...(Array.isArray(excludePatterns) ? excludePatterns : [excludePatterns]),
	].filter(Boolean)

	const files = await glob('**/*.{jsx,tsx}', {
		cwd: pagesDir,
		ignore,
	})

	const imports = new Set()
	const routesMap = new Map()
	const preloadMap = new Map()

	// MODIFICADO: Adicionado Suspense e Outlet (caso precise de loading sem layout)
	imports.add(`import { lazy, Suspense } from 'react';`)
	imports.add(
		`import { createBrowserRouter, Navigate, Outlet } from 'react-router';`,
	)

	const isInvisibleFolder = (folderName) =>
		folderName.startsWith('(') && folderName.endsWith(')')

	// Processar cada arquivo de página
	for (const file of files) {
		const routePath = fileToRoutePath(file)
		const importPath = `${path.join(pagesDir, file)}`
		const normalizedImportPath = normalizePath(importPath)
		const componentName = `P_${Math.random().toString(36).substring(2, 9)}`

		imports.add(
			`const ${componentName} = lazy(() => import('${normalizedImportPath}'));`,
		)
		preloadMap.set(routePath, `() => import('${normalizedImportPath}')`)

		const segments = file.split(path.sep)
		const isIndex =
			segments[segments.length - 1].replace(/\.(jsx|tsx)$/, '') === 'index'

		let currentLevel = routesMap
		let physicalPath = ''

		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i]
			const isFile = i === segments.length - 1
			physicalPath = path.join(physicalPath, segment)

			if (isFile) {
				currentLevel.set(segment, {
					type: 'route',
					path: isIndex
						? ''
						: segment.replace(/\.(jsx|tsx)$/, '').replace(/\[(\w+)\]/g, ':$1'),
					element: componentName,
					isIndex,
					filePath: file,
				})
			} else {
				const isInvisible = isInvisibleFolder(segment)
				const routeSegment = isInvisible
					? ''
					: segment.replace(/\[(\w+)\]/g, ':$1')

				if (!currentLevel.has(segment))
					currentLevel.set(segment, {
						type: 'group',
						physicalName: segment,
						routeSegment,
						children: new Map(),
						isInvisible,
					})

				const nextGroup = currentLevel.get(segment)
				if (!nextGroup.children) nextGroup.children = new Map()
				currentLevel = nextGroup.children
			}
		}
	}

	// Verificar layout, error e loading da raiz
	const rootLayoutPath = path.join(pagesDir, 'layout.jsx')
	const hasRootLayout = await fileExists(rootLayoutPath)
	const rootErrorPath = path.join(pagesDir, 'error.jsx')
	const hasRootError = await fileExists(rootErrorPath)

	// NOVO: Verificar Loading na raiz
	const rootLoadingPath = path.join(pagesDir, 'loading.jsx')
	const hasRootLoading = await fileExists(rootLoadingPath)

	// Função recursiva para gerar estrutura de rotas
	const generateRouteStructure = async (map, parentPhysicalPath = '') => {
		const routes = []

		for (const [physicalName, value] of map) {
			if (value.type === 'route') {
				if (value.isIndex) {
					routes.push(`{ index: true, element: <${value.element} /> }`)
				} else {
					routes.push(`{
                        path: '${value.path}',
                        element: <${value.element} />
                    }`)
				}
			} else if (value.type === 'group') {
				const groupPhysicalPath = path.join(parentPhysicalPath, physicalName)
				const groupRoutePath = value.routeSegment
				const isInvisible = value.isInvisible

				// Verificar arquivos especiais (layout, error, loading)
				const layoutPath = path.join(pagesDir, groupPhysicalPath, 'layout.jsx')
				const hasLayout = await fileExists(layoutPath)

				const errorBoundaryPath = path.join(
					pagesDir,
					groupPhysicalPath,
					'error.jsx',
				)
				const hasErrorBoundary = await fileExists(errorBoundaryPath)

				// NOVO: Verificar loading
				const loadingPath = path.join(
					pagesDir,
					groupPhysicalPath,
					'loading.jsx',
				)
				const hasLoading = await fileExists(loadingPath)

				const childRoutes = await generateRouteStructure(
					value.children,
					groupPhysicalPath,
				)

				// Lógica de construção do Elemento (Layout + Loading)
				let elementCode = null

				// 1. Resolver Loading Component
				let loadingComponentName = null
				if (hasLoading) {
					loadingComponentName = `Load_${Math.random().toString(36).substring(2, 9)}`
					const normalizedLoadingPath = normalizePath(loadingPath)
					imports.add(
						`const ${loadingComponentName} = lazy(() => import('${normalizedLoadingPath}'));`,
					)
				}

				// 2. Resolver Layout Component
				if (hasLayout) {
					const layoutName = `L_${Math.random().toString(36).substring(2, 9)}`
					const normalizedLayoutPath = normalizePath(layoutPath)
					imports.add(
						`const ${layoutName} = lazy(() => import('${normalizedLayoutPath}'));`,
					)
					preloadMap.set(
						isInvisible ? groupPhysicalPath : groupRoutePath,
						`() => import('${normalizedLayoutPath}')`,
					)

					elementCode = `<${layoutName} />`
				} else if (hasLoading && !hasLayout) {
					// Se tem Loading mas não tem Layout, usamos Outlet para poder envolver o conteúdo
					elementCode = `<Outlet />`
				}

				// 3. Envelopar com Suspense se houver loading
				if (hasLoading && elementCode) {
					elementCode = `<Suspense fallback={<${loadingComponentName} />}>${elementCode}</Suspense>`
				}

				const groupProperties = []

				// Se definimos um elemento (seja layout ou wrapper de loading)
				if (elementCode) {
					groupProperties.push(`element: ${elementCode}`)
				}

				if (hasErrorBoundary) {
					const errorBoundaryName = `E_${Math.random().toString(36).substring(2, 9)}`
					const normalizedBoundaryPath = normalizePath(errorBoundaryPath)
					imports.add(
						`const ${errorBoundaryName} = lazy(() => import('${normalizedBoundaryPath}'));`,
					)
					groupProperties.push(`errorElement: <${errorBoundaryName} />`)
				}

				if (childRoutes.trim()) {
					groupProperties.push(`children: [ ${childRoutes} ]`)
				}

				if (isInvisible) {
					if (groupProperties.length > 0) {
						routes.push(`{ ${groupProperties.join(',\n')} }`)
					} else if (childRoutes.trim()) {
						routes.push(childRoutes)
					}
				} else {
					const routeObject = [`path: '${groupRoutePath}'`, ...groupProperties]
					routes.push(`{ ${routeObject.join(',\n')} }`)
				}
			}
		}

		return routes.join(',\n')
	}

	// Gerar estrutura principal
	let routesCode = await generateRouteStructure(routesMap, '')

	// MODIFICADO: Aplicar layout, loading e/ou error boundary raiz se existirem
	if (hasRootLayout || hasRootError || hasRootLoading) {
		const rootRouteObject = ["path: '/'"]

		let rootElementCode = null

		// Preparar Loading Raiz
		let rootLoadingName = null
		if (hasRootLoading) {
			rootLoadingName = `Load_root_${Math.random().toString(36).substring(2, 9)}`
			const normalizedRootLoadingPath = normalizePath(rootLoadingPath)
			imports.add(
				`const ${rootLoadingName} = lazy(() => import('${normalizedRootLoadingPath}'));`,
			)
		}

		// Preparar Layout Raiz
		if (hasRootLayout) {
			const rootLayoutName = `L_root_${Math.random().toString(36).substring(2, 9)}`
			const normalizedRootLayoutPath = normalizePath(rootLayoutPath)
			imports.add(
				`const ${rootLayoutName} = lazy(() => import('${normalizedRootLayoutPath}'));`,
			)
			preloadMap.set('/', `() => import('${normalizedRootLayoutPath}')`)

			rootElementCode = `<${rootLayoutName} />`
		} else if (hasRootLoading) {
			rootElementCode = `<Outlet />`
		}

		// Envelopar Layout Raiz com Suspense se houver loading
		if (hasRootLoading && rootElementCode) {
			rootElementCode = `<Suspense fallback={<${rootLoadingName} />}>${rootElementCode}</Suspense>`
		}

		if (rootElementCode) {
			rootRouteObject.push(`element: ${rootElementCode}`)
		}

		if (hasRootError) {
			const rootErrorName = `E_root_${Math.random().toString(36).substring(2, 9)}`
			const normalizedRootErrorPath = normalizePath(rootErrorPath)
			imports.add(
				`const ${rootErrorName} = lazy(() => import('${normalizedRootErrorPath}'));`,
			)
			rootRouteObject.push(`errorElement: <${rootErrorName} />`)
		}

		rootRouteObject.push(`children: [ ${routesCode} ]`)
		routesCode = `{ ${rootRouteObject.join(',\n')} }`
	}

	// Gerar mapa de pré-carregamento (igual ao original)
	let preloadMapCode = 'export const routePreloadMap = {\n'
	for (const [routePath, importFn] of preloadMap) {
		const normalizedRoute = `/${routePath.replace(/^index$/, '')}`
		preloadMapCode += `  '${normalizedRoute}': ${importFn},\n`
	}
	preloadMapCode += '};\n\n'

	// Função de pré-carregamento (igual ao original)
	const preloadFunctionCode = `
    export function preloadRoute(path) {
      const canPreload = !navigator.connection?.saveData &&
                        navigator.connection?.effectiveType !== 'slow-2g';
      if (!canPreload) return

      const route = normalizeRoutePath(path);
      const preloader = routePreloadMap[route];

      if (preloader) {
        preloader().catch(error => {
          console.error('Route preload failed:', error);
        });
      }
    }

function normalizeRoutePath(path) {
  let normalized = path.split('?')[0];
  normalized = normalized.split('#')[0];

  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  normalized = normalized.replace(/\\/$/, '');
  return normalized || '/';
}
`

	const outputContent = `// ARQUIVO GERADO AUTOMATICAMENTE - NÃO EDITAR MANUALMENTE
${Array.from(imports).join('\n')}

${preloadMapCode}

const routes = createBrowserRouter([
  ${routesCode},
  { path: '*', element: <Navigate to="/404" replace /> }
]);

${preloadFunctionCode}

export default routes;
`

	await fs.writeFile(routesFile, outputContent)
}

// ... (Resto das funções utilitárias: fileToRoutePath, fileExists, normalizePath, etc. permanecem iguais)

// Utilitários
const fileToRoutePath = (filePath) => {
	return filePath
		.replace(/\.(jsx|tsx)$/, '')
		.replace(/[/\\]index$/, '')
		.replace(/\[(\w+)\]/g, ':$1')
}

const fileExists = async (filePath) => {
	try {
		await fs.access(filePath)
		return true
	} catch {
		return false
	}
}

const normalizePath = (pathStr) => {
	return pathStr.replace(/\\/g, '/')
}

const conventionRoutes = (options = {}) => {
	const {
		pagesDir = 'src/pages',
		routesFile = 'src/generated/routes.jsx',
		excludePatterns = [],
	} = options

	return {
		name: 'vite-plugin-convention-routes',
		enforce: 'pre',

		async buildStart() {
			await generateRoutes(pagesDir, routesFile, excludePatterns)
		},

		configureServer(server) {
			const watcher = async (filePath) => {
				if (filePath.includes(pagesDir)) {
					await generateRoutes(pagesDir, routesFile, excludePatterns)
					server.ws.send({ type: 'full-reload' })
				}
			}

			server.watcher.add(path.join(process.cwd(), pagesDir))
			server.watcher.on('add', watcher)
			server.watcher.on('unlink', watcher)
			server.watcher.on('change', watcher)
		},
	}
}

export default conventionRoutes
