import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { Loader2, Plus } from 'lucide-react'

import { usePermissoesList } from 'src/services/permissoes'
import { GenericTable } from 'src/components/table/table'
import { Button } from 'src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card'
import { Badge } from 'src/components/ui/badge'
import { useHeaderConfig } from 'src/hooks/use-header-config'

const PermissoesPage = () => {
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || 20
  const query = searchParams.get('q') || '' 

  const { data, isLoading, isFetching } = usePermissoesList({
    page,
    pageSize,
    term: query,
    fields: ['identifier', 'name', 'category'], 
  })

  useHeaderConfig({
  breadcrumbs: [
    { label: 'Segurança', href: '/' },
    { label: 'Permissões' }
  ],
  // createPermission: 'permissions:create', 
  // newButtonLabel: 'Nova Permissão',
  // onNewClick: () => navigate('/seguranca/permissoes/novo'),
  searchPlaceholder: 'Buscar permissões...'
})

  const headers = useMemo(() => [
    {
      field: 'identifier',
      label: 'Identificador',
      type: 'text',
    },
    {
      field: 'name',
      label: 'Nome',
      type: 'text',
    },
    {
      field: 'category',
      label: 'Categoria',
      type: 'custom',
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      field: 'active',
      label: 'Status',
      type: 'boolean',
      trueLabel: 'Ativo',
      falseLabel: 'Inativo',
    },
  ], [])

  
  const rowActions = useMemo(() => [
    {
      label: 'Editar',
      to: (row) => `/seguranca/permissoes/${row.id}`,
      permission: 'permissions:update',
    }
  ], [])

  const rowCount = data?.pagination?.rowCount || 0

  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Permissões</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Permissões</h1>
              <p className="text-muted-foreground">
                Gerencie as permissões do sistema
              </p>
            </div>
          </div>
          
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Permissões
              {isFetching && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />
              )}
            </CardTitle>
            <CardDescription>
              {rowCount} permissões cadastradas            </CardDescription>
          </CardHeader>
          <CardContent>
            <GenericTable
              data={data?.data || []}
              headers={headers}
              rowActions={rowActions}
              selectableRows={false}
              pagination={{
                pageSize,
                rowCount,
                manageUrlState: true, // 🚀 A tabela gerencia a URL internamente
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default PermissoesPage