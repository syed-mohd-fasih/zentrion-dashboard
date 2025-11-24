import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartPlaceholderProps {
  title: string
  description?: string
  height?: string
}

export function ChartPlaceholder({ title, description, height = "h-64" }: ChartPlaceholderProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className={`${height} bg-muted rounded-xl flex items-center justify-center`}>
          <img src="/service-health-chart-graph-line-chart.jpg" alt={title} className="w-full h-full object-cover rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}
