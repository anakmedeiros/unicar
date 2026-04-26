import { useQuery } from '@tanstack/react-query'
import { catalogoService } from '../../../services/catalogo'

export function useCatalogo() {
  return useQuery({
    queryKey: ['catalogo'],
    queryFn: catalogoService.list,
  })
}
