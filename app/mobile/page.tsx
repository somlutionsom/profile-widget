import dynamic from 'next/dynamic'

// Dynamic import with no SSR for mobile optimization
const MobileProfileWidget = dynamic(
  () => import('../mobile-page'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        width: '100%', 
        height: '450px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div>Loading...</div>
      </div>
    )
  }
)

export default function MobilePage() {
  return <MobileProfileWidget />
}
