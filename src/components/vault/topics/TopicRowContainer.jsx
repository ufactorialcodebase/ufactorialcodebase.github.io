import { useFeatureFlag } from '../../../hooks/useFeatureFlag'
import TopicRow from './TopicRow'
import TopicRowV2 from './TopicRow.v2'

export default function TopicRowContainer(props) {
  const Row = useFeatureFlag('vault_redesign') ? TopicRowV2 : TopicRow
  return <Row {...props} />
}
