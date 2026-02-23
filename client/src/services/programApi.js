import axios from "axios";
import { API_BASE_URL } from "../config/api";

/**
 * Search programs from the Google Sheets data source via the backend.
 *
 * @param {{ program?: string, country?: string, intake?: string }} params
 * @returns {Promise<object[]>}
 */
export const searchPrograms = ({ program = "", country = "", intake = "" }) =>
  axios
    .get(`${API_BASE_URL}/programs/search`, {
      params: { program, country, intake },
    })
    .then((res) => res.data);
