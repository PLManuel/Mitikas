import { useDocumentTitle } from "../hooks/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Mítikas | 404");

  return <h2>404 - Página no encontrada</h2>;
};

export default NotFound;
