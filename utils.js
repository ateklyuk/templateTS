const getFieldValue = (customFields, fieldId) => {
  const field = customFields
    ? customFields.find((item) => String(item.field_id || item.id) === String(fieldId))
    : undefined;
  const value = field ? field.values[0].value : undefined;
  return value;
};

const makeField = (field_id, value) => {
    if (!value) {
      return undefined;
    }
    return {
      field_id,
      values: [
        {
          value,
        },
      ],
    };
  };
  

module.exports = {
  getFieldValue,
  makeField
};
