import { createFileRoute } from '@tanstack/react-router'
import NeighborhoodScene from '../components/NeighborhoodScene'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <NeighborhoodScene />
    </div>
  )
}
