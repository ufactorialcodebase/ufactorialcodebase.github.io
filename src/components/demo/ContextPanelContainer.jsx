import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import ContextPanelV1 from './ContextPanel'
import ContextPanelV2 from './ContextPanel.v2'

export default function ContextPanelContainer(props) {
  const flagOn = useFeatureFlag('vault_redesign')
  const Panel = flagOn ? ContextPanelV2 : ContextPanelV1
  return <Panel {...props} />
}
