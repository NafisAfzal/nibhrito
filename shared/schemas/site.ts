import { object, text, ValidationError } from '../protocol/encoding';
export interface SiteInfo {
  operator_name: string;
  contact_email: string;
  jurisdiction: string;
  local: boolean;
}
export function siteInfo(value: unknown): SiteInfo {
  const data = object(value, [
    'operator_name',
    'contact_email',
    'jurisdiction',
    'local',
  ]);
  if (typeof data['local'] !== 'boolean') throw new ValidationError();
  const local = data['local'];
  const result = {
    operator_name: text(data['operator_name'], 256, 128, local),
    contact_email: text(data['contact_email'], 254, 254, local),
    jurisdiction: text(data['jurisdiction'], 256, 128, local),
    local,
  };
  if (
    result.contact_email &&
    !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(
      result.contact_email,
    )
  )
    throw new ValidationError();
  if (
    !local &&
    /(?:example\.(?:com|org|net)|\.invalid|\.test)$/i.test(result.contact_email)
  )
    throw new ValidationError();
  return result;
}
