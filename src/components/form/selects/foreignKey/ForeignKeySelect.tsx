import { Autocomplete, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import { useModelConfigQuery } from "../../../../pages/models/useModelConfigQuery";
import { useDebounce } from "../../../../utils/useDebounce";
import { getForeignKeyOptionLabel } from "./getForeignKeyOptionLabel";
import { useForeignKeySelectSearchQuery } from "./useForeignKeySelectSearchQuery";

export interface ForeignKeySelectProps {
  value: string | null;
  onChange: (newValue: string | null) => void;
  errorMessage?: string;
  inputLabel: string;
  labelFields: string[];
  modelName: string;
  separator?: string;
  selectValue: ForeignKeySelectOption | null;
  setSelectValue: (newValue: ForeignKeySelectOption | null) => void;
}

export type ForeignKeySelectOption = {
  label: string;
  value: string;
};

export const ForeignKeySelect = ({
  modelName,
  labelFields,
  onChange,
  inputLabel,
  separator,
  selectValue,
}: ForeignKeySelectProps) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedSearchTerm = useDebounce(inputValue, 500); // 500 ms de délai
  const modelQuery = useModelConfigQuery(modelName);

  const filtersToUse = useMemo(() => {
    if (debouncedSearchTerm === "") return JSON.stringify([]);
    return JSON.stringify(
      labelFields.map((labelField) => ({
        id: labelField,
        value: debouncedSearchTerm,
      }))
    );
  }, [debouncedSearchTerm, labelFields]);

  const listQuery = useForeignKeySelectSearchQuery(
    modelName,
    debouncedSearchTerm,
    filtersToUse
  );

  const options: { label: string; value: string }[] = useMemo(() => {
    if (!listQuery.data || !modelQuery.data) {
      if (selectValue === null) return [];
      return [selectValue];
    }

    const opts = listQuery.data.data.map((model) => ({
      value: model[modelQuery.data.primaryKey].toString(),
      label: getForeignKeyOptionLabel(model, labelFields, separator),
    }));

    if (!selectValue) return opts;

    const found = opts.find((opt) => opt.value === selectValue.value);

    if (found) return opts;

    return [selectValue, ...opts];
  }, [listQuery.data, modelQuery.data, selectValue, labelFields, separator]);

  return (
    <Autocomplete
      value={selectValue}
      onChange={(_e, newValue) => {
        onChange(newValue?.value ?? null);
      }}
      inputValue={inputValue}
      onInputChange={(_e, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      renderInput={(params) => (
        <TextField {...params} label={inputLabel} variant="outlined" />
      )}
      loading={listQuery.isLoading}
      loadingText="Chargement..."
      isOptionEqualToValue={(option, value) => option.value === value.value}
    />
  );
};
