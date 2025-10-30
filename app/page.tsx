import HomeBody from "@/components/HomeBody/HomeBody";

//TODO: Refactorizar codigo
//TODO: Mejorar la UI
//TODO: Mejorar el responsive
//TODO: Crear un modulo de Estimacion de mercado aprovechando el listado de productos en la base de datos
//TODO: Crear un modulo de presupuestos para el calculo de los presupuestos
//TODO: Crear un modulo de estimacion de gastos por quincena
//TODO: Crear un modulo de Deudas y Deudores
//FIXME: Corregir fallo al capturar valor del msm, toma la , como si fuera tambien decimales

const page = () => {
  return (
    <>
      <HomeBody />
    </>
  );
};

export default page;
