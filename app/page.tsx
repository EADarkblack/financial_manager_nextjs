//Components
import HomeBody from "@/components/HomeBody/HomeBody";

//TODO: Crear un modulo de Estimacion de mercado aprovechando el listado de productos en la base de datos
//TODO: Crear un modulo de presupuestos para el calculo de los presupuestos / estimacion de gastos por quincena
//TODO: Crear un modulo de Deudas y Deudores
//TODO: Crear pantalla de carga

//FIXME: Corregir fallo con las horas y las fechas en la grafica
//FIXME: Buscar forma de mantener la aplicacion msm forwader activo siempre en mi celular o en su defecto desarrollar una aplicacion con React native que me permita hacer lo mismo
const page = () => {
  return (
    <>
      <HomeBody />
    </>
  );
};

export default page;
