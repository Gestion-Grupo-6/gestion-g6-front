-- Insert reviews for hotels
INSERT INTO reviews (place_id, user_name, user_avatar, rating, title, comment, date) 
SELECT 
  id,
  'María González',
  '/placeholder.svg?height=40&width=40',
  5,
  'Experiencia inolvidable',
  'El hotel superó todas nuestras expectativas. La atención del personal fue excepcional y las instalaciones impecables. Sin duda volveremos.',
  '15 de marzo, 2024'
FROM places WHERE name = 'Hotel Boutique Palermo';

INSERT INTO reviews (place_id, user_name, user_avatar, rating, title, comment, date)
SELECT 
  id,
  'Carlos Rodríguez',
  '/placeholder.svg?height=40&width=40',
  5,
  'Perfecto para desconectar',
  'La ubicación en medio de la selva es espectacular. Despertarse con los sonidos de la naturaleza no tiene precio. Muy recomendable.',
  '8 de abril, 2024'
FROM places WHERE name = 'Eco Lodge Iguazú';

-- Insert reviews for restaurants
INSERT INTO reviews (place_id, user_name, user_avatar, rating, title, comment, date)
SELECT 
  id,
  'Laura Martínez',
  '/placeholder.svg?height=40&width=40',
  5,
  'La mejor carne de mi vida',
  'Simplemente espectacular. El bife de chorizo estaba en su punto perfecto y el vino recomendado por el sommelier fue excelente.',
  '22 de marzo, 2024'
FROM places WHERE name = 'Parrilla Don Julio';

INSERT INTO reviews (place_id, user_name, user_avatar, rating, title, comment, date)
SELECT 
  id,
  'Diego Fernández',
  '/placeholder.svg?height=40&width=40',
  5,
  'Experiencia gastronómica única',
  'Cada plato es una obra de arte. El menú degustación con maridaje fue una experiencia sensorial completa. Vale cada peso.',
  '5 de abril, 2024'
FROM places WHERE name = 'Tegui';

-- Insert reviews for activities
INSERT INTO reviews (place_id, user_name, user_avatar, rating, title, comment, date)
SELECT 
  id,
  'Ana Silva',
  '/placeholder.svg?height=40&width=40',
  5,
  'Impresionante',
  'Las cataratas son aún más espectaculares en persona. El tour estuvo muy bien organizado y el guía fue excelente. Experiencia imperdible.',
  '18 de marzo, 2024'
FROM places WHERE name = 'Tour Cataratas del Iguazú';

INSERT INTO reviews (place_id, user_name, user_avatar, rating, title, comment, date)
SELECT 
  id,
  'Roberto López',
  '/placeholder.svg?height=40&width=40',
  5,
  'Tango auténtico',
  'El show fue increíble, bailarines profesionales y la cena deliciosa. Una noche perfecta para conocer la cultura argentina.',
  '12 de abril, 2024'
FROM places WHERE name = 'Tango Show & Cena';

-- Insert reviews for destinations
INSERT INTO reviews (place_id, user_name, user_avatar, rating, title, comment, date)
SELECT 
  id,
  'Patricia Gómez',
  '/placeholder.svg?height=40&width=40',
  5,
  'Ciudad fascinante',
  'Buenos Aires tiene todo: cultura, gastronomía, arquitectura hermosa y gente cálida. Pasamos una semana y nos faltó tiempo.',
  '25 de marzo, 2024'
FROM places WHERE name = 'Buenos Aires';

INSERT INTO reviews (place_id, user_name, user_avatar, rating, title, comment, date)
SELECT 
  id,
  'Javier Morales',
  '/placeholder.svg?height=40&width=40',
  5,
  'Maravilla natural',
  'Ver las cataratas en persona es algo que todos deberían experimentar. La fuerza del agua y la belleza del entorno son indescriptibles.',
  '10 de abril, 2024'
FROM places WHERE name = 'Cataratas del Iguazú';
