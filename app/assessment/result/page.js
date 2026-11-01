import ResultClient from './ResultClient'
import { getPlanFormUrl } from '../../lib/assessmentSettings.js'

export const dynamic = 'force-dynamic'

export default async function AssessmentResultPage() {
  const planFormUrl = await getPlanFormUrl()
  return <ResultClient planFormUrl={planFormUrl} />
}
