import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFindings, FindingsList } from '@router-poc/shared'

export const Route = createFileRoute('/findings/risks')({
  component: function RisksPage() {
    const { data: items = [] } = useQuery({ queryKey: ['findings', 'risks'], queryFn: () => fetchFindings('risks') })
    return <FindingsList items={items} />
  },
})
