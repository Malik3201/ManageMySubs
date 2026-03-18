import Badge from '../ui/Badge';
import { statusColor, capitalize } from '../../utils/formatters';

export default function StatusBadge({ status }) {
  return (
    <Badge className={statusColor(status)}>
      {capitalize(status)}
    </Badge>
  );
}
