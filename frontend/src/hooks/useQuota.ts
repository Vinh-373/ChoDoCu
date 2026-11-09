import { useFetch } from "./useFetch";
import { nguoiDungApi } from "../api/nguoiDung";

export default function useQuota() {
  const { data, loading, error, reload } = useFetch(() => nguoiDungApi.layHoSo(), []);
  return {
    luotDang: data?.luotDang ?? 0,
    luotDay: data?.luotDay ?? 0,
    loading,
    error,
    reload,
  };
}
