import { useState, useEffect } from 'react';
import { Star, CheckCircle, Phone, Mail, MapPin, ArrowRight, Users, Shield, Clock, Sparkles, Home, Building, Calendar, Award, Target, Heart, Zap, TrendingUp, CheckSquare, MessageCircle, PlayCircle } from 'lucide-react';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'hogar' | 'empresa'>('hogar');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const testimonials = [
    {
      name: "José Castro",
      role: "Cliente",
      text: "Servicio excelente y puntual, la Auxiliar muy profesional y atenta, cumplió con todo lo programado sin inconvenientes.",
      rating: 5,
      avatar: "JC"
    },
    {
      name: "Elizabeth Ríos", 
      role: "Cliente",
      text: "Muy satisfecha con la calidad del servicio en mi oficina, la limpieza se realizó de forma profesional, profunda y rápida.",
      rating: 5,
      avatar: "ER"
    },
    {
      name: "Susana Hoyos",
      role: "Cliente", 
      text: "Experiencia muy positiva, todo se hizo de forma organizada y eficiente, definitivamente los volveré a contratar.",
      rating: 5,
      avatar: "SH"
    }
  ];

  const services = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Profesionales Capacitados",
      description: "Auxiliares Reluzca entrenados para brindar un servicio de alta calidad"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Confianza y Seguridad",
      description: "Personal verificado con la más alta discreción y responsabilidad"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Puntualidad Garantizada",
      description: "Cumplimos con los horarios acordados para tu tranquilidad"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Resultados Impecables",
      description: "Técnicas profesionales que garantizan espacios frescos y acogedores"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Agenda tu Servicio",
      description: "Selecciona el día y hora que mejor te convenga a través de nuestra plataforma"
    },
    {
      step: "2", 
      title: "Confirmamos tu Cita",
      description: "Verificamos la disponibilidad y confirmamos todos los detalles de tu servicio"
    },
    {
      step: "3",
      title: "Auxiliar Asignada",
      description: "Una profesional Reluzca llega a tu hogar u oficina en el horario acordado"
    },
    {
      step: "4",
      title: "Disfruta el Resultado",
      description: "Tu espacio queda impecable, fresco y acogedor para que puedas disfrutarlo"
    }
  ];

  const whyChooseUs = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Experiencia Comprobada",
      description: "Más de 3 años brindando servicios de limpieza profesional en Medellín y el área metropolitana.",
      highlight: "Líderes en el sector"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Atención Personalizada",
      description: "Cada servicio se adapta a tus necesidades específicas, horarios y requerimientos particulares.",
      highlight: "100% personalizado"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Tecnología Avanzada",
      description: "Utilizamos productos ecológicos y equipos de última generación para garantizar los mejores resultados.",
      highlight: "Eco-friendly"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Mejora Continua",
      description: "Capacitamos constantemente a nuestro personal y evaluamos cada servicio para mantener la excelencia.",
      highlight: "Siempre mejorando"
    }
  ];

  const serviceTypes = {
    hogar: {
      title: "Servicios para el Hogar",
      subtitle: "Tu hogar merece el mejor cuidado",
      services: [
        { name: "Limpieza General", description: "Limpieza completa de todas las áreas de tu hogar" },
        { name: "Limpieza Profunda", description: "Servicio detallado para una limpieza exhaustiva" },
        { name: "Mantenimiento Regular", description: "Planes semanales, quincenales o mensuales" },
        { name: "Limpieza Post-Obra", description: "Especializado en limpieza después de remodelaciones" }
      ]
    },
    empresa: {
      title: "Servicios Empresariales",
      subtitle: "Espacios profesionales impecables",
      services: [
        { name: "Oficinas Corporativas", description: "Limpieza integral para espacios de trabajo" },
        { name: "Consultorios Médicos", description: "Desinfección especializada para centros de salud" },
        { name: "Comercios y Tiendas", description: "Mantenimiento para espacios comerciales" },
        { name: "Edificios Residenciales", description: "Limpieza de áreas comunes y zonas sociales" }
      ]
    }
  };

  const guarantees = [
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: "Garantía de Satisfacción",
      description: "Si no quedas completamente satisfecho, regresamos sin costo adicional"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Personal Asegurado",
      description: "Todo nuestro personal cuenta con pólizas de responsabilidad civil"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Puntualidad Garantizada",
      description: "Llegamos a tiempo o te compensamos con descuentos en tu próximo servicio"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCF7F0]">
      {/* Header/Navigation */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#4894AD]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-15">
          <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <img src="/image/logo.png" alt="Reluzca Logo" className="h-30 w-auto" />
          </div>

            
            <nav className="hidden md:flex space-x-8">
              <a href="#inicio" className="text-gray-700 hover:text-[#4894AD] transition-colors">Inicio</a>
              <a href="#servicios" className="text-gray-700 hover:text-[#4894AD] transition-colors">Servicios</a>
              <a href="#como-funciona" className="text-gray-700 hover:text-[#4894AD] transition-colors">Cómo Funciona</a>
              <a href="#por-que-elegirnos" className="text-gray-700 hover:text-[#4894AD] transition-colors">Por Qué Elegirnos</a>
              <a href="#testimonios" className="text-gray-700 hover:text-[#4894AD] transition-colors">Testimonios</a>
              <a href="#contacto" className="text-gray-700 hover:text-[#4894AD] transition-colors">Contacto</a>
            </nav>

            <div className="flex space-x-4">
              <Link to="/auth/login" className="hidden md:inline-flex px-4 py-2 text-[#4894AD] border border-[#4894AD] rounded-lg hover:bg-[#4894AD] hover:text-white transition-all duration-300">
                  {t('auth.login')}
              </Link>
              <Link to="/auth/sign_up" className="px-6 py-2 bg-[#D95B26] text-white rounded-lg hover:bg-[#D95B26]/90 transition-all duration-300 shadow-lg hover:shadow-xl">
                  {t('landing.createUser')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4894AD]/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-[#D95B26]/10 rounded-full text-[#D95B26] text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                App.Reluzca.com
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Cuidamos cada rincón de tu 
                <span className="text-[#4894AD]"> hogar y empresa</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Nuestras Auxiliares Reluzca utilizan técnicas que garantizan espacios impecables, 
                frescos y acogedores, para que disfrutes de un ambiente limpio sin preocuparte por nada.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-[#D95B26] text-white rounded-xl hover:bg-[#D95B26]/90 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center group">
                  {t('landing.scheduleNow')}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border-2 border-[#4894AD] text-[#4894AD] rounded-xl hover:bg-[#4894AD] hover:text-white transition-all duration-300">
                  {t('landing.howItWorks')}
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                  <span>Personal Verificado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                  <span>Servicio Garantizado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-orange-500" />
                  <span>Disponible 24/7</span>
                </div>
              </div>
            </div>

            <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                <div className="absolute top-4 right-4 w-12 h-12 bg-[#D95B26]/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#D95B26]" />
                </div>
                
                <div className="aspect-square bg-gradient-to-br from-[#4894AD]/20 to-[#4894AD]/5 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-[#4894AD] rounded-full flex items-center justify-center mx-auto">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Líderes en limpieza profesional</h3>
                    <p className="text-[#195083]">Más de <span className="font-bold text-[#D95B26]">500 clientes satisfechos</span> confían en nosotros</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Services Section */}
      <section id="servicios" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              {t('landing.services.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-14 h-14 bg-[#4894AD]/10 rounded-xl flex items-center justify-center text-[#4894AD] mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-[#195083] leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>

          {/* Service Types Tabs */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestros Servicios Especializados</h3>
              <p className="text-gray-600">Adaptamos nuestros servicios a tus necesidades específicas</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-xl p-1 inline-flex">
                <button
                  onClick={() => setActiveTab('hogar')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === 'hogar' 
                      ? 'bg-[#4894AD] text-white shadow-lg' 
                      : 'text-gray-600 hover:text-[#4894AD]'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Hogar</span>
                </button>
                <button
                  onClick={() => setActiveTab('empresa')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === 'empresa' 
                      ? 'bg-[#4894AD] text-white shadow-lg' 
                      : 'text-gray-600 hover:text-[#4894AD]'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span>Empresa</span>
                </button>
              </div>
            </div>

            <div className="text-center mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{serviceTypes[activeTab].title}</h4>
              <p className="text-[#195083]">{serviceTypes[activeTab].subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {serviceTypes[activeTab].services.map((service, index) => (
                <div key={index} className="bg-[#FCF7F0] rounded-xl p-6 border-l-4 border-[#D95B26]">
                  <h5 className="font-bold text-gray-900 mb-2">{service.name}</h5>
                  <p className="text-[#195083] text-sm">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Cómo Funciona Nuestro Servicio</h2>
            <p className="text-xl text-gray-600">Un proceso <span className="text-[#D95B26] font-semibold">simple y confiable</span> en 4 pasos</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#D95B26] rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-[#195083] leading-relaxed">{item.description}</p>
                </div>
                
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#D95B26] to-transparent transform -translate-x-8"></div>
                )}
              </div>
            ))}
          </div>

          {/* Guarantees */}
          <div className="bg-gradient-to-r from-[#4894AD]/5 to-[#D95B26]/5 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestras Garantías</h3>
              <p className="text-[#195083]">Tu tranquilidad es nuestra prioridad</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {guarantees.map((guarantee, index) => (
                <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="w-12 h-12 bg-[#D95B26]/10 rounded-full flex items-center justify-center text-[#D95B26] mx-auto mb-4">
                    {guarantee.icon}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{guarantee.title}</h4>
                  <p className="text-[#195083] text-sm">{guarantee.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="por-que-elegirnos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">¿Por Qué Elegir Reluzca?</h2>
            <p className="text-xl text-gray-600">Somos <span className="text-[#D95B26] font-semibold">más que un servicio de limpieza</span>, somos tu socio de confianza</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {whyChooseUs.map((item, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="w-16 h-16 bg-[#4894AD]/10 rounded-xl flex items-center justify-center text-[#4894AD] flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                      <span className="text-xs bg-[#D95B26] text-white px-2 py-1 rounded-full">{item.highlight}</span>
                    </div>
                    <p className="text-[#195083] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#4894AD] to-[#D95B26] rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">Certificación de Calidad</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#195083]">Personal Capacitado</span>
                    <span className="text-[#D95B26] font-bold">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#D95B26] h-2 rounded-full w-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#195083]">Satisfacción del Cliente</span>
                    <span className="text-[#D95B26] font-bold">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#D95B26] h-2 rounded-full w-[98%]"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#195083]">Puntualidad</span>
                    <span className="text-[#D95B26] font-bold">99%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#D95B26] h-2 rounded-full w-[99%]"></div>
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-[#4894AD] text-white rounded-xl hover:bg-[#4894AD]/90 transition-all duration-300 flex items-center justify-center space-x-2">
                  <PlayCircle className="w-5 h-5" />
                  <span>Ver Video Testimonial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Lo que nuestros Usuarios dicen</h2>
            <p className="text-xl text-gray-600">Testimonios reales de <span className="text-[#D95B26] font-semibold">clientes satisfechos</span></p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative"
              >
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-[#D95B26]/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#D95B26]" />
                  </div>
                </div>

                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#D95B26] fill-current" />
                  ))}
                </div>
                
                <p className="text-[#195083] leading-relaxed mb-6 italic">&ldquo;{testimonial.text}&rdquo;</p>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#4894AD] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-[#195083] text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof */}

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-4xl font-bold text-gray-900">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600">
              Resolvemos las <span className="text-[#D95B26] font-semibold">dudas más comunes</span> de nuestros clientes
            </p>
          </div>

          {/* Ajuste: más columnas en pantallas grandes, menos gap vertical */}
          <div className="grid md:grid-cols-2 gap-2">
            {[
              {
                question: "¿Qué incluye el servicio de limpieza general?",
                answer: "Nuestro servicio de limpieza general incluye aspirado, trapeado, limpieza de baños, cocina, desempolvado de muebles, organización básica y limpieza de vidrios internos. Cada servicio se adapta a las necesidades específicas de tu hogar."
              },
              {
                question: "¿Cómo garantizan la seguridad y confiabilidad del personal?",
                answer: "Todo nuestro personal pasa por un riguroso proceso de selección que incluye verificación de referencias, antecedentes judiciales y capacitación continua. Además, contamos con pólizas de seguro que cubren cualquier eventualidad."
              },
              {
                question: "¿Puedo programar servicios regulares?",
                answer: "¡Por supuesto! Ofrecemos planes de limpieza regulares semanales, quincenales o mensuales con descuentos especiales. Puedes gestionar tu cronograma fácilmente a través de nuestra plataforma digital."
              },
              {
                question: "¿Qué productos utilizan para la limpieza?",
                answer: "Utilizamos productos de alta calidad, ecológicos y biodegradables que son seguros para tu familia y mascotas. Si tienes preferencias específicas o alergias, podemos usar los productos que prefieras."
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#D95B26]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#D95B26] font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                    <p className="text-[#195083] leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[#195083] mb-4">¿Tienes más preguntas?</p>
            <button className="px-8 py-3 bg-[#4894AD] text-white rounded-xl hover:bg-[#4894AD]/90 transition-all duration-300">
              Contáctanos Ahora
            </button>
          </div>
        </div>
      </section>


      {/* Service Areas Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Zonas de Cobertura</h2>
            <p className="text-xl text-gray-600">Llevamos nuestro servicio <span className="text-[#D95B26] font-semibold">hasta tu puerta</span> en toda el área metropolitana</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              { area: "Medellín Centro"},
              { area: "El Poblado",},
              { area: "Laureles"},
              { area: "Envigado"},
              { area: "Sabaneta"},
              { area: "Itagüí",}
            ].map((zone, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="w-16 h-16 bg-[#4894AD]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-[#4894AD]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{zone.area}</h3>

              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#4894AD]/5 to-[#D95B26]/5 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Tu zona no está en la lista?</h3>
            <p className="text-[#195083] mb-6">Estamos en constante expansión. Contáctanos y te informaremos cuando lleguemos a tu área.</p>
            <button className="px-8 py-3 bg-[#D95B26] text-white rounded-xl hover:bg-[#D95B26]/90 transition-all duration-300">
              Consultar Disponibilidad
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#4894AD] to-[#4894AD]/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="space-y-8">
            <div className="inline-flex items-center px-6 py-3 bg-[#D95B26] rounded-full text-white font-medium">
              <Calendar className="w-5 h-5 mr-2" />
              Agenda Hoy - Disfruta Mañana
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6">
              ¿Listo para tener tu espacio impecable?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Únete a cientos de clientes satisfechos que confían en Reluzca para mantener sus hogares y oficinas impecables
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-12 py-4 bg-[#D95B26] text-white rounded-xl hover:bg-[#D95B26]/90 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-lg">
                Agendar Mi Servicio Ahora
              </button>
              <button className="px-12 py-4 bg-white text-[#4894AD] rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-lg">
                Solicitar Cotización
              </button>
            </div>

            <div className="flex justify-center items-center space-x-8 text-white/80 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Sin compromiso</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Respuesta inmediata</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Cotización gratuita</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">Reluzca</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Líderes en servicios de limpieza profesional para hogares y empresas en Medellín y el área metropolitana.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-[#D95B26] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-[#D95B26] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">@</span>
                </div>
                <div className="w-8 h-8 bg-[#D95B26] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">in</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#D95B26]">Servicios</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Limpieza de Hogar</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Limpieza de Oficinas</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Servicio Regular</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Limpieza Profunda</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Limpieza Post-Obra</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#D95B26]">Empresa</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Trabaja con Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Política de Calidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Términos y Condiciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:text-[#4894AD]">Política de Privacidad</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#D95B26]">Contacto</h3>
              <div className="space-y-4 text-gray-400">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#4894AD]/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[#4894AD]" />
                  </div>
                  <div>
                    <div className="text-white font-medium">+57 300 123 4567</div>
                    <div className="text-xs">Línea de atención 24/7</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#4894AD]/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#4894AD]" />
                  </div>
                  <div>
                    <div className="text-white font-medium">hola@reluzca.com</div>
                    <div className="text-xs">Respuesta en menos de 2 horas</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#4894AD]/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#4894AD]" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Medellín, Antioquia</div>
                    <div className="text-xs">Cobertura área metropolitana</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-center md:text-left">
                &copy; 2024 Reluzca. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Desarrollado con</span>
                <Heart className="w-4 h-4 text-[#D95B26]" />
                <span>en Medellín</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}