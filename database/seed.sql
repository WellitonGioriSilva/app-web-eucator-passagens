DROP DATABASE IF EXISTS db_eucator_passagens;
CREATE DATABASE db_eucator_passagens;
USE db_eucator_passagens;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM driver_trips;
DELETE FROM tickets;
DELETE FROM payments;
DELETE FROM sales;
DELETE FROM seats;
DELETE FROM trips;
DELETE FROM drivers;
DELETE FROM buses;
DELETE FROM routes;
DELETE FROM cities;

ALTER TABLE cities AUTO_INCREMENT = 1;
ALTER TABLE routes AUTO_INCREMENT = 1;
ALTER TABLE buses AUTO_INCREMENT = 1;
ALTER TABLE trips AUTO_INCREMENT = 1;
ALTER TABLE seats AUTO_INCREMENT = 1;
ALTER TABLE drivers AUTO_INCREMENT = 1;
ALTER TABLE driver_trips AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO cities (nome, uf) VALUES
('Sao Paulo', 'SP'),
('Rio de Janeiro', 'RJ'),
('Belo Horizonte', 'MG'),
('Curitiba', 'PR'),
('Porto Alegre', 'RS'),
('Florianopolis', 'SC'),
('Salvador', 'BA'),
('Fortaleza', 'CE'),
('Recife', 'PE'),
('Manaus', 'AM'),
('Belem', 'PA'),
('Goiania', 'GO'),
('Brasilia', 'DF'),
('Campo Grande', 'MS'),
('Cuiaba', 'MT'),
('Palmas', 'TO'),
('Sao Luis', 'MA'),
('Joao Pessoa', 'PB'),
('Natal', 'RN'),
('Teresina', 'PI');

INSERT INTO routes (cidadeOrigemId, cidadeDestinoId, distancia) VALUES
(1, 2, 430),
(1, 3, 586),
(2, 4, 852),
(3, 5, 1710),
(4, 6, 300),
(5, 7, 3170),
(6, 8, 3600),
(7, 9, 800),
(8, 10, 4000),
(9, 11, 2070);

INSERT INTO buses (placa, modelo, capacidade) VALUES
('ABC-1234', 'Mercedes Benz O-400 RSD', 46),
('DEF-5678', 'Volvo B450R', 42),
('GHI-9012', 'Scania K410', 44),
('JKL-3456', 'Mercedes Benz O-371', 50),
('MNO-7890', 'Volvo B12M', 48);

INSERT INTO trips
(dtHoraSaida, dtHoraSaidaVolta, duracao, valor, tipoViagem, busId, routeId, routeVoltaId, urlImagem)
VALUES
('2026-06-10 08:00:00', NULL, '02:00:00', 120.50, 'I', 1, 1, NULL, 'https://picsum.photos/seed/cidade1/800/600'),
('2026-06-10 09:15:00', '2026-06-20 13:45:00', '01:35:00', 95.00, 'IV', 2, 1, 1, 'https://picsum.photos/seed/cidade2/800/600'),
('2026-06-11 07:00:00', NULL, '02:30:00', 150.75, 'I', 3, 2, NULL, 'https://picsum.photos/seed/cidade3/800/600'),
('2026-06-11 14:00:00', '2026-06-18 18:10:00', '01:50:00', 110.00, 'IV', 4, 2, 2, 'https://picsum.photos/seed/cidade4/800/600'),
('2026-06-12 06:30:00', NULL, '01:29:00', 89.90, 'I', 5, 3, NULL, 'https://picsum.photos/seed/cidade5/800/600'),
('2026-06-12 15:20:00', NULL, '02:10:00', 130.25, 'I', 1, 4, NULL, 'https://picsum.photos/seed/cidade6/800/600'),
('2026-06-13 08:45:00', '2026-06-19 12:30:00', '01:45:00', 105.60, 'IV', 2, 4, 4, 'https://picsum.photos/seed/cidade7/800/600'),
('2026-06-13 17:00:00', NULL, '02:20:00', 140.00, 'I', 3, 5, NULL, 'https://picsum.photos/seed/cidade8/800/600'),
('2026-06-14 05:50:00', '2026-06-21 09:25:00', '01:39:00', 99.99, 'IV', 4, 5, 5, 'https://picsum.photos/seed/cidade9/800/600'),
('2026-06-14 18:30:00', NULL, '02:40:00', 160.80, 'I', 5, 6, NULL, 'https://picsum.photos/seed/cidade10/800/600');

INSERT INTO seats (numero, tipo, busId) VALUES
('01', 'Convencional', 1), ('02', 'Convencional', 1), ('03', 'Convencional', 1), ('04', 'Convencional', 1),
('05', 'Convencional', 1), ('06', 'Convencional', 1), ('07', 'Convencional', 1), ('08', 'Convencional', 1),
('09', 'Convencional', 1), ('10', 'Convencional', 1), ('11', 'Convencional', 1), ('12', 'Convencional', 1),
('13', 'Convencional', 1), ('14', 'Convencional', 1), ('15', 'Convencional', 1), ('16', 'Convencional', 1),
('17', 'Convencional', 1), ('18', 'Convencional', 1), ('19', 'Convencional', 1), ('20', 'Convencional', 1),
('21', 'Convencional', 1), ('22', 'Convencional', 1), ('23', 'Convencional', 1), ('24', 'Convencional', 1),
('25', 'Convencional', 1), ('26', 'Convencional', 1), ('27', 'Convencional', 1), ('28', 'Convencional', 1),
('29', 'Convencional', 1), ('30', 'Convencional', 1), ('31', 'Convencional', 1), ('32', 'Convencional', 1),
('33', 'Convencional', 1), ('34', 'Convencional', 1), ('35', 'Convencional', 1), ('36', 'Convencional', 1),
('37', 'Leito', 1), ('38', 'Leito', 1), ('39', 'Leito', 1), ('40', 'Leito', 1),
('41', 'Leito', 1), ('42', 'Leito', 1), ('43', 'Leito', 1), ('44', 'Leito', 1),
('45', 'Leito', 1), ('46', 'Leito', 1);

INSERT INTO seats (numero, tipo, busId) VALUES
('01', 'Convencional', 2), ('02', 'Convencional', 2), ('03', 'Convencional', 2), ('04', 'Convencional', 2),
('05', 'Convencional', 2), ('06', 'Convencional', 2), ('07', 'Convencional', 2), ('08', 'Convencional', 2),
('09', 'Convencional', 2), ('10', 'Convencional', 2), ('11', 'Convencional', 2), ('12', 'Convencional', 2),
('13', 'Convencional', 2), ('14', 'Convencional', 2), ('15', 'Convencional', 2), ('16', 'Convencional', 2),
('17', 'Convencional', 2), ('18', 'Convencional', 2), ('19', 'Convencional', 2), ('20', 'Convencional', 2),
('21', 'Convencional', 2), ('22', 'Convencional', 2), ('23', 'Convencional', 2), ('24', 'Convencional', 2),
('25', 'Convencional', 2), ('26', 'Convencional', 2), ('27', 'Convencional', 2), ('28', 'Convencional', 2),
('29', 'Convencional', 2), ('30', 'Convencional', 2), ('31', 'Convencional', 2), ('32', 'Convencional', 2),
('33', 'Leito', 2), ('34', 'Leito', 2), ('35', 'Leito', 2), ('36', 'Leito', 2),
('37', 'Leito', 2), ('38', 'Leito', 2), ('39', 'Leito', 2), ('40', 'Leito', 2),
('41', 'Leito', 2), ('42', 'Leito', 2);

INSERT INTO seats (numero, tipo, busId) VALUES
('01', 'Convencional', 3), ('02', 'Convencional', 3), ('03', 'Convencional', 3), ('04', 'Convencional', 3),
('05', 'Convencional', 3), ('06', 'Convencional', 3), ('07', 'Convencional', 3), ('08', 'Convencional', 3),
('09', 'Convencional', 3), ('10', 'Convencional', 3), ('11', 'Convencional', 3), ('12', 'Convencional', 3),
('13', 'Convencional', 3), ('14', 'Convencional', 3), ('15', 'Convencional', 3), ('16', 'Convencional', 3),
('17', 'Convencional', 3), ('18', 'Convencional', 3), ('19', 'Convencional', 3), ('20', 'Convencional', 3),
('21', 'Convencional', 3), ('22', 'Convencional', 3), ('23', 'Convencional', 3), ('24', 'Convencional', 3),
('25', 'Convencional', 3), ('26', 'Convencional', 3), ('27', 'Convencional', 3), ('28', 'Convencional', 3),
('29', 'Convencional', 3), ('30', 'Convencional', 3), ('31', 'Convencional', 3), ('32', 'Convencional', 3),
('33', 'Convencional', 3), ('34', 'Convencional', 3),
('35', 'Leito', 3), ('36', 'Leito', 3), ('37', 'Leito', 3), ('38', 'Leito', 3),
('39', 'Leito', 3), ('40', 'Leito', 3), ('41', 'Leito', 3), ('42', 'Leito', 3),
('43', 'Leito', 3), ('44', 'Leito', 3);

INSERT INTO seats (numero, tipo, busId) VALUES
('01', 'Convencional', 4), ('02', 'Convencional', 4), ('03', 'Convencional', 4), ('04', 'Convencional', 4),
('05', 'Convencional', 4), ('06', 'Convencional', 4), ('07', 'Convencional', 4), ('08', 'Convencional', 4),
('09', 'Convencional', 4), ('10', 'Convencional', 4), ('11', 'Convencional', 4), ('12', 'Convencional', 4),
('13', 'Convencional', 4), ('14', 'Convencional', 4), ('15', 'Convencional', 4), ('16', 'Convencional', 4),
('17', 'Convencional', 4), ('18', 'Convencional', 4), ('19', 'Convencional', 4), ('20', 'Convencional', 4),
('21', 'Convencional', 4), ('22', 'Convencional', 4), ('23', 'Convencional', 4), ('24', 'Convencional', 4),
('25', 'Convencional', 4), ('26', 'Convencional', 4), ('27', 'Convencional', 4), ('28', 'Convencional', 4),
('29', 'Convencional', 4), ('30', 'Convencional', 4), ('31', 'Convencional', 4), ('32', 'Convencional', 4),
('33', 'Convencional', 4), ('34', 'Convencional', 4), ('35', 'Convencional', 4), ('36', 'Convencional', 4),
('37', 'Convencional', 4), ('38', 'Convencional', 4), ('39', 'Convencional', 4), ('40', 'Convencional', 4),
('41', 'Leito', 4), ('42', 'Leito', 4), ('43', 'Leito', 4), ('44', 'Leito', 4),
('45', 'Leito', 4), ('46', 'Leito', 4), ('47', 'Leito', 4), ('48', 'Leito', 4),
('49', 'Leito', 4), ('50', 'Leito', 4);

INSERT INTO seats (numero, tipo, busId) VALUES
('01', 'Convencional', 5), ('02', 'Convencional', 5), ('03', 'Convencional', 5), ('04', 'Convencional', 5),
('05', 'Convencional', 5), ('06', 'Convencional', 5), ('07', 'Convencional', 5), ('08', 'Convencional', 5),
('09', 'Convencional', 5), ('10', 'Convencional', 5), ('11', 'Convencional', 5), ('12', 'Convencional', 5),
('13', 'Convencional', 5), ('14', 'Convencional', 5), ('15', 'Convencional', 5), ('16', 'Convencional', 5),
('17', 'Convencional', 5), ('18', 'Convencional', 5), ('19', 'Convencional', 5), ('20', 'Convencional', 5),
('21', 'Convencional', 5), ('22', 'Convencional', 5), ('23', 'Convencional', 5), ('24', 'Convencional', 5),
('25', 'Convencional', 5), ('26', 'Convencional', 5), ('27', 'Convencional', 5), ('28', 'Convencional', 5),
('29', 'Convencional', 5), ('30', 'Convencional', 5), ('31', 'Convencional', 5), ('32', 'Convencional', 5),
('33', 'Convencional', 5), ('34', 'Convencional', 5), ('35', 'Convencional', 5), ('36', 'Convencional', 5),
('37', 'Convencional', 5), ('38', 'Convencional', 5),
('39', 'Leito', 5), ('40', 'Leito', 5), ('41', 'Leito', 5), ('42', 'Leito', 5),
('43', 'Leito', 5), ('44', 'Leito', 5), ('45', 'Leito', 5), ('46', 'Leito', 5),
('47', 'Leito', 5), ('48', 'Leito', 5);

INSERT INTO drivers (nome, cnh, email) VALUES
('Carlos Eduardo Silva', '12345678900', 'carlos.silva@eucator.com'),
('Marcos Antonio Pereira', '23456789011', 'marcos.pereira@eucator.com'),
('Fernanda Lima Souza', '34567890122', 'fernanda.lima@eucator.com'),
('Roberto Nascimento', '45678901233', 'roberto.nascimento@eucator.com'),
('Patricia Oliveira', '56789012344', 'patricia.oliveira@eucator.com'),
('Joao Batista Costa', '67890123455', 'joao.costa@eucator.com'),
('Ana Paula Mendes', '78901234566', 'ana.mendes@eucator.com');

INSERT INTO driver_trips (driverId, tripId) VALUES
(1, 1),
(2, 2),
(7, 2),
(3, 3),
(1, 4),
(6, 4),
(4, 5),
(2, 6),
(5, 6),
(3, 7),
(6, 8),
(7, 8),
(4, 9),
(5, 10),
(1, 10);
