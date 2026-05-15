import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyProps {
  title?: string
  description?: string
  className?: string
}

export default function Empty({ 
  title = '暂无内容', 
  description = '这里还没有内容', 
  className 
}: EmptyProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-20 text-center',
      'bg-white/40 rounded-2xl',
      className
    )}>
      <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
        <Inbox className="w-12 h-12 text-indigo-500" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-lg">{description}</p>
    </div>
  )
}
