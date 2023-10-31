import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { privateAxios } from "../../../axios/privateAxios";
import { notifySuccess } from "../../../errors/notifiySuccess";
import { ModelData, ModelFieldsConfig } from "../model.types";

interface Props {
  modelConfig: ModelFieldsConfig;
}

interface UpdateModelResponse {
  message: string;
  model: ModelData;
}

export const useCreateModel = ({ modelConfig }: Props) => {
  const navigate = useNavigate();
  const createMutation = useMutation(
    async (values: ModelData) => {
      const res = await privateAxios.post<UpdateModelResponse>(
        `/adomin/api/crud/${modelConfig.name}`,
        values
      );

      return res.data;
    },
    {
      onSuccess: () => {
        notifySuccess(`${modelConfig.label.toLocaleLowerCase()} créé`);
        navigate(`/adomin/${modelConfig.name}`);
      },
    }
  );

  const createModel = async (values: ModelData) => {
    await createMutation.mutateAsync(values);
  };

  return { createModel, isLoading: createMutation.isLoading };
};
