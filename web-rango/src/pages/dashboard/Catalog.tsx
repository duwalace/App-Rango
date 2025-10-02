import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Catalog = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para a lista de produtos
    navigate("/dashboard/products", { replace: true });
  }, [navigate]);

  return null;
};

export default Catalog;
