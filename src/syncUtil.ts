import { FIELDS_MAPPING } from './constants';

export const encodeObject = (fields: PlayerFieldsToBeSync | BaseFieldsToBeSync): Array<unknown> => {
  return FIELDS_MAPPING.map((fieldName: string) => {
    //TODO: better fix
    return (fields as any)[fieldName];
  });
};

export const decodeObject = (values: Array<any>): PlayerFieldsToBeSync | BaseFieldsToBeSync => {
  return FIELDS_MAPPING.reduce((prev, fieldName, index) => {
    const value = values[index];
    return {
      ...prev,
      [fieldName]: value,
    };
  }, <BaseFieldsToBeSync>{});
};
