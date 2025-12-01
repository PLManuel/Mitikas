import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { IconMapPin, IconPhone, IconMail, IconHeart, IconStar, IconPaw, IconSparkles } from "@tabler/icons-react";
import artesaniasImg from "../assets/productos.jpg";
import sedeImg from "../assets/sede.jpg";

const About = () => {
  useDocumentTitle("Mítikas | Nosotros");

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-mtk-principal">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-8 flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Mítikas Artesanías</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Vivimos con pasión la misión de difundir lo nuestro: el <span className="text-mtk-principal font-semibold">arte</span>,
              la <span className="text-mtk-principal font-semibold">tradición</span> y
              la <span className="text-mtk-principal font-semibold">identidad peruana</span>.
            </p>
          </div>
          <div className="h-64 md:h-auto">
            <img 
              src={sedeImg} 
              alt="Mítikas Logo" 
              className="w-full object-cover max-h-96 rounded-2xl bg-white p-4"
            />
          </div>
        </div>
      </div>

      {/* Nuestra Esencia */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <IconHeart className="w-8 h-8 text-mtk-principal" />
          <h2 className="text-3xl font-bold text-gray-800">Nuestra Esencia</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            En <span className="font-semibold text-mtk-principal">Mítikas Artesanías</span>, vivimos con pasión la misión de difundir lo nuestro:
            el arte, la tradición y la identidad peruana. Cada producto que elaboramos nace del amor por nuestras raíces
            y la creatividad de manos artesanas que dan vida a piezas únicas, llenas de alma.
          </p>
          <p>
            Con el tiempo, este compromiso nos ha llevado a convertirnos en una <span className="font-semibold">marca referente
              de la artesanía peruana</span>, reconocida por ofrecer calidad, autenticidad y un fuerte vínculo con la cultura nacional.
          </p>
        </div>
      </div>

      {/* Llévate un pedacito del Perú */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <img 
            src={artesaniasImg} 
            alt="Artesanías Peruanas" 
            className="w-full h-64 object-cover"
          />
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <img 
            src={sedeImg} 
            alt="Nuestra Sede" 
            className="w-full h-64 object-cover"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-4">
          <IconSparkles className="w-7 h-7 text-mtk-principal" />
          <h2 className="text-3xl font-bold text-gray-800">Llévate un pedacito del Perú</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Desde Lima, Perú, te invitamos a llevarte algo más que un regalo: una conexión con nuestra historia. 
          Nuestras decoraciones para el hogar, souvenirs, y hasta detalles para tus mascotas llevan consigo 
          colores, texturas y símbolos que nos representan.
        </p>
      </div>      {/* Información de Contacto */}
      <div className="bg-linear-to-r from-mtk-principal to-red-700 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Encuéntranos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 p-4 rounded-full mb-3">
              <IconMapPin className="w-8 h-8" />
            </div>
            <h3 className="font-semibold mb-2">Visítanos</h3>
            <p className="text-sm">Av. Aviación 5095, Tienda 78-79, Surco</p>
            <p className="text-xs mt-1 opacity-90">(a una cuadra del Óvalo Higuereta)</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 p-4 rounded-full mb-3">
              <IconPhone className="w-8 h-8" />
            </div>
            <h3 className="font-semibold mb-2">Llámanos</h3>
            <p className="text-sm">+51 991 799 759</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 p-4 rounded-full mb-3">
              <IconMail className="w-8 h-8" />
            </div>
            <h3 className="font-semibold mb-2">Escríbenos</h3>
            <p className="text-sm">merybean87@gmail.com</p>
          </div>
        </div>
      </div>

      {/* ¿Por qué elegirnos? */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <IconStar className="w-8 h-8 text-mtk-principal" />
          <h2 className="text-3xl font-bold text-gray-800">¿Por qué elegirnos?</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-mtk-fondo rounded-lg">
            <div className="shrink-0 w-10 h-10 bg-mtk-principal text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Hecho a mano por artesanos peruanos</h3>
              <p className="text-sm text-gray-600">Cada pieza es única y elaborada con dedicación</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-mtk-fondo rounded-lg">
            <div className="shrink-0 w-10 h-10 bg-mtk-principal text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Diseños originales, llenos de identidad</h3>
              <p className="text-sm text-gray-600">Reflejamos la riqueza cultural del Perú</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-mtk-fondo rounded-lg">
            <div className="shrink-0 w-10 h-10 bg-mtk-principal text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Atención cercana y personalizada</h3>
              <p className="text-sm text-gray-600">Te ayudamos a encontrar el regalo perfecto</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-mtk-fondo rounded-lg">
            <div className="shrink-0 w-10 h-10 bg-mtk-principal text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Productos únicos, perfectos para regalo</h3>
              <p className="text-sm text-gray-600">Sorprende con artesanía auténtica</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-mtk-fondo rounded-lg md:col-span-2">
            <div className="shrink-0 w-10 h-10 bg-mtk-principal text-white rounded-full flex items-center justify-center">
              <IconPaw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Detalles artesanales también para tus mascotas</h3>
              <p className="text-sm text-gray-600">Productos especiales para los miembros peludos de tu familia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
