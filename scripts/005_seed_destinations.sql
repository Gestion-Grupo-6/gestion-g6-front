-- Insert destinations data
INSERT INTO places (name, type, description, location, price_range, image_url, gallery_images, rating, review_count, contact_phone, contact_email, amenities) VALUES
(
  'Buenos Aires',
  'destino',
  'La capital argentina combina arquitectura europea, cultura vibrante y gastronomía de clase mundial. Desde el tango en San Telmo hasta las boutiques de Palermo.',
  'Buenos Aires, Argentina',
  '$$',
  '/luxury-beach-hotel-resort.jpg',
  ARRAY['/elegant-restaurant-interior.jpg', '/mayan-pyramid-chichen-itza.jpg'],
  4.8,
  5678,
  '',
  '',
  ARRAY['Tango', 'Gastronomía', 'Museos', 'Vida nocturna', 'Shopping', 'Arquitectura']
),
(
  'Cataratas del Iguazú',
  'destino',
  'Una de las Siete Maravillas Naturales del Mundo. 275 saltos de agua en medio de la selva subtropical, experiencia única e imponente.',
  'Misiones, Argentina',
  '$$',
  '/mayan-pyramid-chichen-itza.jpg',
  ARRAY['/caribbean-beach-turquoise-water.jpg', '/eco-lodge-jungle-nature.jpg'],
  4.9,
  8901,
  '',
  '',
  ARRAY['Naturaleza', 'Aventura', 'Fotografía', 'Senderismo', 'Fauna silvestre']
),
(
  'Patagonia Argentina',
  'destino',
  'Paisajes épicos de glaciares, montañas y lagos. Desde el Glaciar Perito Moreno hasta el Fitz Roy, la Patagonia ofrece aventuras incomparables.',
  'Santa Cruz, Argentina',
  '$$$',
  '/caribbean-beach-turquoise-water.jpg',
  ARRAY['/mayan-pyramid-chichen-itza.jpg'],
  4.9,
  4567,
  '',
  '',
  ARRAY['Glaciares', 'Trekking', 'Montañismo', 'Fotografía', 'Naturaleza prístina']
),
(
  'Mendoza',
  'destino',
  'Capital del vino argentino al pie de los Andes. Bodegas de clase mundial, gastronomía excepcional y paisajes de viñedos con montañas nevadas.',
  'Mendoza, Argentina',
  '$$',
  '/elegant-restaurant-interior.jpg',
  ARRAY['/gourmet-food-plating-presentation.jpg', '/luxury-beach-hotel-resort.jpg'],
  4.7,
  3456,
  '',
  '',
  ARRAY['Vinos', 'Bodegas', 'Gastronomía', 'Montañismo', 'Rafting', 'Ski']
);
