// src/components/vault/IconRailContainer.jsx
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import IconRail from './IconRail'
import IconRailV2 from './IconRail.v2'

export default function IconRailContainer(props) {
  const Rail = useFeatureFlag('vault_redesign') ? IconRailV2 : IconRail
  return <Rail {...props} />
}
