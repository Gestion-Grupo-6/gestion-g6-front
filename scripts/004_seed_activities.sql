-- Insert activities data
INSERT INTO places (name, type, description, location, price_range, image_url, gallery_images, rating, review_count, contact_phone, contact_email, amenities) VALUES
(
  'Tour Cataratas del Iguazú',
  'actividad',
  'Recorrido completo por las Cataratas del Iguazú, incluyendo pasarelas, Garganta del Diablo y paseo en lancha. Una experiencia inolvidable.',
  'Parque Nacional Iguazú, Misiones',
  '$$',
  '/mayan-pyramid-chichen-itza.jpg',
  ARRAY['/caribbean-beach-turquoise-water.jpg'],
  4.9,
  3456,
  '+54 3757 49-1234',
  'tours@iguazuexperience.com.ar',
  ARRAY['Guía profesional', 'Transporte incluido', 'Almuerzo', 'Seguro', 'Grupos reducidos']
),
(
  'Tango Show & Cena',
  'actividad',
  'Espectáculo de tango profesional con cena gourmet de 3 pasos. Vive la pasión del tango argentino en un ambiente auténtico.',
  'San Telmo, Buenos Aires',
  '$$$',
  '/luxury-beach-hotel-resort.jpg',
  ARRAY['/elegant-restaurant-interior.jpg'],
  4.8,
  1890,
  '+54 11 4307-6696',
  'reservas@tangoshow.com.ar',
  ARRAY['Cena incluida', 'Show profesional', 'Bebidas', 'Transporte opcional', 'Clase de tango']
),
(
  'Cabalgata en la Patagonia',
  'actividad',
  'Excursión a caballo por paisajes patagónicos únicos. Apto para todos los niveles, con guías expertos y equipamiento completo.',
  'El Calafate, Santa Cruz',
  '$$',
  '/caribbean-beach-turquoise-water.jpg',
  ARRAY['/mayan-pyramid-chichen-itza.jpg'],
  4.7,
  567,
  '+54 2902 49-1234',
  'info@patagoniacabalgatas.com.ar',
  ARRAY['Guía bilingüe', 'Equipamiento incluido', 'Refrigerio', 'Todos los niveles', 'Grupos pequeños']
),
(
  'Wine Tour Mendoza',
  'actividad',
  'Tour por las mejores bodegas de Mendoza con degustaciones y almuerzo gourmet. Descubre los vinos de clase mundial de Argentina.',
  'Valle de Uco, Mendoza',
  '$$$',
  '/elegant-restaurant-interior.jpg',
  ARRAY['/gourmet-food-plating-presentation.jpg'],
  4.9,
  1234,
  '+54 261 424-1234',
  'tours@mendozawine.com.ar',
  ARRAY['3 bodegas', 'Degustaciones', 'Almuerzo gourmet', 'Transporte', 'Sommelier experto']
);
