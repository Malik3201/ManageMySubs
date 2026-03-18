import Badge from '../ui/Badge';
import { paymentColor, capitalize } from '../../utils/formatters';

export default function PaymentBadge({ status }) {
  return (
    <Badge className={paymentColor(status)}>
      {capitalize(status)}
    </Badge>
  );
}
