import { useSearchParams } from 'react-router'
import { useCallback } from 'react'
import qs from 'qs'

/**
 * Hook customizado para gerenciar estado de paginação através da URL
 * 
 * @param {Object} options - Opções de configuração
 * @param {number} options.defaultPageSize - Tamanho padrão da página (default: 10)
 * @returns {Object} Objeto com pageIndex, pageSize e handlePaginationChange
 */
export function useTableStateFromUrl({ defaultPageSize = 10 } = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Lê os parâmetros da URL
  const page = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || defaultPageSize

  // Converte para 0-indexed (React Table usa 0-index)
  const pageIndex = page - 1

  // Função para atualizar a URL quando a paginação muda
  const handlePaginationChange = useCallback((updaterOrValue) => {
    // TanStack Table pode passar uma função updater ou um valor direto
    const newPagination = typeof updaterOrValue === 'function'
      ? updaterOrValue({ pageIndex, pageSize })
      : updaterOrValue

    const params = {
      page: (newPagination.pageIndex ?? 0) + 1, // Converte de 0-index para 1-index
      pageSize: newPagination.pageSize ?? pageSize,
    }
    
    setSearchParams(qs.stringify(params), { replace: true })
  }, [setSearchParams, pageIndex, pageSize])

  return {
    pageIndex,
    pageSize,
    page, // Retorna também a versão 1-indexed para uso na API
    handlePaginationChange,
  }
}
