import EditPostClient from './EditPostClient'

export default async function EditPostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  return <EditPostClient id={id} />
}