import { randomUUID } from 'crypto';
import { Produto } from '../models/produto';
import { ProdutoRepository } from './produtoRepository';


const produtos: Produto[] = [
  {
    id: 'rtx-4070-super', nome: 'ASUS Dual GeForce RTX 4070 SUPER OC 12GB', descricao: 'Placa ASUS com GPU NVIDIA, dois ventiladores Axial-tech, Ray Tracing e DLSS 3.', preco: 4299.9, estoque: 14,
    categoriaId: 'placas-de-video', especificacoes: { 'Modelo': 'DUAL-RTX4070S-O12G', 'Memória': '12GB GDDR6X', 'Interface': 'PCIe 4.0', 'Clock boost': '2520 MHz (2550 MHz em OC)' }, altaDemanda: true,
  },
  {
    id: 'rx-7800-xt', nome: 'ASUS Dual Radeon RX 7800 XT OC 16GB', descricao: 'GPU AMD RDNA 3 com 16GB de memória, refrigeração com dois ventiladores e Dual BIOS.', preco: 3599.9, estoque: 9,
    categoriaId: 'placas-de-video', especificacoes: { 'Modelo': 'DUAL-RX7800XT-O16G', 'Memória': '16GB GDDR6', 'Interface': 'PCIe 4.0', 'Clock boost': 'até 2520 MHz em OC' }, altaDemanda: true,
  },
  {
    id: 'rtx-4060', nome: 'ASUS Dual GeForce RTX 4060 OC 8GB', descricao: 'GeForce RTX 4060 da ASUS com DLSS 3 e refrigeração Axial-tech para jogos em Full HD.', preco: 1899.9, estoque: 30,
    categoriaId: 'placas-de-video', especificacoes: { 'Modelo': 'DUAL-RTX4060-O8G', 'Memória': '8GB GDDR6', 'Interface': 'PCIe 4.0', 'Consumo': '115W' }, altaDemanda: true,
  },
  {
    id: 'ryzen-7-7800x3d', nome: 'AMD Ryzen 7 7800X3D 8 núcleos AM5', descricao: 'Processador Zen 4 com AMD 3D V-Cache, 8 núcleos e 16 threads para jogos e multitarefa.', preco: 2399.9, estoque: 12,
    categoriaId: 'processadores', especificacoes: { 'Modelo': '100-100000910WOF', 'Núcleos': '8 / 16 threads', 'Socket': 'AM5', 'Clock': 'até 5.0 GHz', 'Cache L2 + L3': '104MB', 'TDP': '120W' }, altaDemanda: false,
  },
  {
    id: 'core-i5-14600k', nome: 'Intel Core i5-14600K 14 núcleos LGA1700', descricao: 'Processador Intel Core de 14ª geração com 14 núcleos, 20 threads e gráficos UHD 770.', preco: 1799.9, estoque: 20,
    categoriaId: 'processadores', especificacoes: { 'Modelo': 'BX8071514600K', 'Núcleos': '14 / 20 threads', 'Socket': 'LGA1700', 'Clock': 'até 5.3 GHz', 'Cache': '24MB', 'Potência base': '125W' }, altaDemanda: false,
  },
  {
    id: 'monitor-27-165', nome: 'Monitor LG UltraGear 27GP850-B 27" QHD 165Hz', descricao: 'Monitor UltraGear com painel Nano IPS, resolução QHD e compatibilidade G-SYNC.', preco: 1599.9, estoque: 18,
    categoriaId: 'monitores', especificacoes: { 'Modelo': '27GP850-B', 'Tamanho': '27"', 'Resolução': '2560 × 1440', 'Taxa': '165Hz (180Hz em OC)', 'Painel': 'Nano IPS', 'Resposta': '1ms GtG' }, altaDemanda: false,
  },
  {
    id: 'monitor-34-ultrawide', nome: 'Monitor LG UltraGear 34GP83A-B 34" 144Hz', descricao: 'Monitor ultrawide curvo com painel Nano IPS e resolução 3440 × 1440 para jogos e produtividade.', preco: 2799.9, estoque: 6,
    categoriaId: 'monitores', especificacoes: { 'Modelo': '34GP83A-B', 'Tamanho': '34"', 'Resolução': '3440 × 1440', 'Taxa': '144Hz (160Hz em OC)', 'Painel': 'Nano IPS', 'Resposta': '1ms GtG' }, altaDemanda: false,
  },
  {
    id: 'teclado-mecanico-rgb', nome: 'Teclado Mecânico Logitech G413 SE', descricao: 'Teclado mecânico com switches táteis, teclas PBT e iluminação branca.', preco: 249.9, estoque: 50,
    categoriaId: 'teclados', especificacoes: { 'Modelo': 'G413 SE', 'Switch': 'Tátil', 'Formato': 'Completo', 'Conexão': 'USB', 'Iluminação': 'LED branco' }, altaDemanda: false,
  },
  {
    id: 'teclado-75-wireless', nome: 'Teclado Mecânico Logitech G915 LIGHTSPEED RGB', descricao: 'Teclado sem fio de perfil baixo com iluminação LIGHTSYNC RGB e conexão LIGHTSPEED.', preco: 699.9, estoque: 15,
    categoriaId: 'teclados', especificacoes: { 'Modelo': 'G915', 'Formato': 'Completo, perfil baixo', 'Conexão': 'LIGHTSPEED / Bluetooth', 'Iluminação': 'LIGHTSYNC RGB', 'Bateria': 'até 30h com iluminação a 100%' }, altaDemanda: false,
  },
  {
    id: 'mouse-gamer-26k', nome: 'Mouse Logitech G305 LIGHTSPEED Sem Fio', descricao: 'Mouse sem fio com sensor HERO e conexão LIGHTSPEED, alimentado por uma pilha AA.', preco: 449.9, estoque: 25,
    categoriaId: 'mouses', especificacoes: { 'Modelo': 'G305', 'DPI': 'até 12.000', 'Peso': '99g', 'Conexão': 'LIGHTSPEED 2.4GHz', 'Bateria': 'até 250h' }, altaDemanda: false,
  },
  {
    id: 'mouse-ergonomico', nome: 'Mouse Logitech G502 HERO 25.600 DPI', descricao: 'Mouse com sensor HERO, 11 botões programáveis e pesos ajustáveis.', preco: 159.9, estoque: 60,
    categoriaId: 'mouses', especificacoes: { 'Modelo': 'G502 HERO', 'DPI': 'até 25.600', 'Botões': '11 programáveis', 'Conexão': 'USB', 'Iluminação': 'LIGHTSYNC RGB' }, altaDemanda: false,
  },
  {
    id: 'headset-7-1', nome: 'Headset Logitech G432 Surround 7.1', descricao: 'Headset com drivers de 50mm, DTS Headphone:X 2.0 e microfone flip-to-mute.', preco: 399.9, estoque: 33,
    categoriaId: 'headsets', especificacoes: { 'Modelo': 'G432', 'Driver': '50mm', 'Som': 'DTS Headphone:X 2.0', 'Conexão': 'USB / 3.5mm', 'Microfone': '6mm, flip-to-mute' }, altaDemanda: false,
  },
  {
    id: 'headset-wireless', nome: 'Headset Logitech G733 LIGHTSPEED RGB', descricao: 'Headset sem fio leve, com suspensão ajustável, iluminação RGB e microfone BLUE VO!CE.', preco: 799.9, estoque: 11,
    categoriaId: 'headsets', especificacoes: { 'Modelo': 'G733', 'Conexão': 'LIGHTSPEED 2.4GHz', 'Bateria': 'até 29h', 'Peso': '278g', 'Driver': 'PRO-G 40mm' }, altaDemanda: false,
  },
  {
    id: 'ram-ddr5-32', nome: 'Kingston FURY Beast RGB DDR5 32GB 6000MHz', descricao: 'Kit de memória Kingston FURY Beast DDR5 com dissipador e iluminação RGB.', preco: 699.9, estoque: 40,
    categoriaId: 'memorias', especificacoes: { 'Modelo': 'KF560C36BBEAK2-32', 'Capacidade': '32GB (2 × 16GB)', 'Tipo': 'DDR5', 'Frequência': '6000MHz', 'Latência': 'CL36' }, altaDemanda: false,
  },
  {
    id: 'ram-ddr4-16', nome: 'Kingston FURY Beast DDR4 16GB 3200MHz', descricao: 'Memória Kingston FURY Beast DDR4 com dissipador de perfil baixo.', preco: 219.9, estoque: 80,
    categoriaId: 'memorias', especificacoes: { 'Modelo': 'KF432C16BB/16', 'Capacidade': '16GB', 'Tipo': 'DDR4', 'Frequência': '3200MHz', 'Latência': 'CL16' }, altaDemanda: false,
  },
  {
    id: 'ssd-nvme-1tb', nome: 'SSD Samsung 980 PRO NVMe 1TB PCIe 4.0', descricao: 'SSD Samsung 980 PRO com interface PCIe 4.0 NVMe para jogos e aplicações profissionais.', preco: 549.9, estoque: 45,
    categoriaId: 'armazenamento', especificacoes: { 'Modelo': 'MZ-V8P1T0', 'Capacidade': '1TB', 'Interface': 'PCIe 4.0 NVMe', 'Leitura': 'até 7000MB/s', 'Gravação': 'até 5000MB/s' }, altaDemanda: false,
  },
  {
    id: 'hd-2tb', nome: 'SSD Samsung 870 EVO SATA 2TB', descricao: 'SSD SATA de 2,5 polegadas com memória Samsung V-NAND para armazenamento e upgrades.', preco: 399.9, estoque: 22,
    categoriaId: 'armazenamento', especificacoes: { 'Modelo': 'MZ-77E2T0', 'Capacidade': '2TB', 'Formato': '2.5"', 'Interface': 'SATA III', 'Leitura': 'até 560MB/s', 'Gravação': 'até 530MB/s' }, altaDemanda: false,
  },
  {
    id: 'placa-mae-b650', nome: 'ASUS TUF Gaming B650-PLUS WIFI AM5 DDR5', descricao: 'Placa-mãe ATX para plataforma AMD AM5 com memória DDR5, Wi-Fi 6 e Ethernet 2.5Gb.', preco: 1299.9, estoque: 10,
    categoriaId: 'placas-mae', especificacoes: { 'Modelo': 'TUF GAMING B650-PLUS WIFI', 'Socket': 'AM5', 'Chipset': 'B650', 'Memória': 'DDR5', 'Formato': 'ATX', 'Rede': 'Wi-Fi 6 + 2.5Gb Ethernet' }, altaDemanda: false,
  },
  {
    id: 'fonte-750w', nome: 'Fonte Corsair RM750x 750W 80 PLUS Gold', descricao: 'Fonte de alimentação Corsair RM750x, totalmente modular e certificada 80 PLUS Gold.', preco: 649.9, estoque: 17,
    categoriaId: 'fontes', especificacoes: { 'Modelo': 'RM750x', 'Potência': '750W', 'Certificação': '80 PLUS Gold', 'Modular': 'Sim' }, altaDemanda: false,
  },
  {
    id: 'gabinete-vidro', nome: 'Gabinete Corsair 4000D AIRFLOW Vidro Temperado', descricao: 'Gabinete Mid Tower com painel frontal de alto fluxo de ar, vidro temperado e dois fans AirGuide.', preco: 379.9, estoque: 21,
    categoriaId: 'gabinetes', especificacoes: { 'Modelo': 'CC-9011200-WW', 'Formato': 'Mid Tower', 'Placas': 'ATX / mATX / Mini-ITX', 'Fans inclusos': '2 × AirGuide 120mm', 'Lateral': 'Vidro temperado' }, altaDemanda: false,
  },
  {
    id: 'rtx-5060', nome: 'ASUS Dual GeForce RTX 5060 OC 8GB', descricao: 'ASUS Dual GeForce RTX 5060 OC 8GB. Modelo: DUAL-RTX5060-O8G. Memória: 8GB GDDR7.', preco: 2299.9, estoque: 10,
    categoriaId: 'placas-de-video', especificacoes: { 'Modelo': 'DUAL-RTX5060-O8G', 'Memória': '8GB GDDR7' }, altaDemanda: true,
  },
  {
    id: 'rtx-5060-ti', nome: 'ASUS Dual GeForce RTX 5060 TI OC 16GB', descricao: 'ASUS Dual GeForce RTX 5060 TI OC 16GB. Modelo: DUAL-RTX5060TI-O16G. Memória: 16GB GDDR7.', preco: 3499.9, estoque: 11,
    categoriaId: 'placas-de-video', especificacoes: { 'Modelo': 'DUAL-RTX5060TI-O16G', 'Memória': '16GB GDDR7' }, altaDemanda: true,
  },
  {
    id: 'rtx-5070', nome: 'ASUS Prime GeForce RTX 5070 OC 12GB', descricao: 'ASUS Prime GeForce RTX 5070 OC 12GB. Modelo: PRIME-RTX5070-O12G. Memória: 12GB GDDR7.', preco: 4599.9, estoque: 12,
    categoriaId: 'placas-de-video', especificacoes: { 'Modelo': 'PRIME-RTX5070-O12G', 'Memória': '12GB GDDR7' }, altaDemanda: true,
  },
  {
    id: 'rx-7600', nome: 'ASUS Dual Radeon RX 7600 OC 8GB', descricao: 'ASUS Dual Radeon RX 7600 OC 8GB. Modelo: DUAL-RX7600-O8G. Memória: 8GB GDDR6.', preco: 1599.9, estoque: 13,
    categoriaId: 'placas-de-video', especificacoes: { 'Modelo': 'DUAL-RX7600-O8G', 'Memória': '8GB GDDR6' }, altaDemanda: true,
  },
  {
    id: 'prime-b550', nome: 'Placa-mãe ASUS Prime B550M-A WIFI II', descricao: 'Placa-mãe ASUS Prime B550M-A WIFI II. Modelo: Prime B550M-A WIFI II. Socket: AM4. Memória: DDR4.', preco: 699.9, estoque: 14,
    categoriaId: 'placas-mae', especificacoes: { 'Modelo': 'Prime B550M-A WIFI II', 'Socket': 'AM4', 'Memória': 'DDR4' }, altaDemanda: false,
  },
  {
    id: 'tuf-b760', nome: 'Placa-mãe ASUS TUF Gaming B760-PLUS WIFI', descricao: 'Placa-mãe ASUS TUF Gaming B760-PLUS WIFI. Modelo: TUF Gaming B760-PLUS WIFI. Socket: LGA1700. Memória: DDR5.', preco: 1199.9, estoque: 15,
    categoriaId: 'placas-mae', especificacoes: { 'Modelo': 'TUF Gaming B760-PLUS WIFI', 'Socket': 'LGA1700', 'Memória': 'DDR5' }, altaDemanda: false,
  },
  {
    id: 'prime-a620', nome: 'Placa-mãe ASUS Prime A620M-A', descricao: 'Placa-mãe ASUS Prime A620M-A. Modelo: Prime A620M-A. Socket: AM5. Memória: DDR5.', preco: 649.9, estoque: 16,
    categoriaId: 'placas-mae', especificacoes: { 'Modelo': 'Prime A620M-A', 'Socket': 'AM5', 'Memória': 'DDR5' }, altaDemanda: false,
  },
  {
    id: 'tuf-b550', nome: 'Placa-mãe ASUS TUF Gaming B550-PLUS WIFI II', descricao: 'Placa-mãe ASUS TUF Gaming B550-PLUS WIFI II. Modelo: TUF Gaming B550-PLUS WIFI II. Socket: AM4. Memória: DDR4.', preco: 949.9, estoque: 17,
    categoriaId: 'placas-mae', especificacoes: { 'Modelo': 'TUF Gaming B550-PLUS WIFI II', 'Socket': 'AM4', 'Memória': 'DDR4' }, altaDemanda: false,
  },
  {
    id: 'prime-b650', nome: 'Placa-mãe ASUS Prime B650-PLUS', descricao: 'Placa-mãe ASUS Prime B650-PLUS. Modelo: Prime B650-PLUS. Socket: AM5. Memória: DDR5.', preco: 999.9, estoque: 18,
    categoriaId: 'placas-mae', especificacoes: { 'Modelo': 'Prime B650-PLUS', 'Socket': 'AM5', 'Memória': 'DDR5' }, altaDemanda: false,
  },
  {
    id: 'case-4000d-white', nome: 'Gabinete Corsair 4000D AIRFLOW Branco', descricao: 'Gabinete Corsair 4000D AIRFLOW Branco. Modelo: 4000D AIRFLOW Branco. Tipo: Gabinete para PC.', preco: 399.9, estoque: 19,
    categoriaId: 'gabinetes', especificacoes: { 'Modelo': '4000D AIRFLOW Branco', 'Tipo': 'Gabinete para PC' }, altaDemanda: false,
  },
  {
    id: 'psu-rm650x', nome: 'Fonte Corsair RM650x 650W', descricao: 'Fonte Corsair RM650x 650W. Modelo: RM650x. Potência: 650W.', preco: 549.9, estoque: 20,
    categoriaId: 'fontes', especificacoes: { 'Modelo': 'RM650x', 'Potência': '650W' }, altaDemanda: false,
  },
  {
    id: 'psu-rm850x', nome: 'Fonte Corsair RM850x 850W', descricao: 'Fonte Corsair RM850x 850W. Modelo: RM850x. Potência: 850W.', preco: 799.9, estoque: 21,
    categoriaId: 'fontes', especificacoes: { 'Modelo': 'RM850x', 'Potência': '850W' }, altaDemanda: false,
  },
  {
    id: 'psu-rm1000x', nome: 'Fonte Corsair RM1000x 1000W', descricao: 'Fonte Corsair RM1000x 1000W. Modelo: RM1000x. Potência: 1000W.', preco: 1099.9, estoque: 22,
    categoriaId: 'fontes', especificacoes: { 'Modelo': 'RM1000x', 'Potência': '1000W' }, altaDemanda: false,
  },
  {
    id: 'g213', nome: 'Logitech G213 Prodigy', descricao: 'Logitech G213 Prodigy. Modelo: G213 Prodigy. Iluminação: RGB. Conexão: USB.', preco: 199.9, estoque: 23,
    categoriaId: 'teclados', especificacoes: { 'Modelo': 'G213 Prodigy', 'Iluminação': 'RGB', 'Conexão': 'USB' }, altaDemanda: false,
  },
  {
    id: 'g512', nome: 'Logitech G512 Carbon', descricao: 'Logitech G512 Carbon. Modelo: G512 Carbon. Tipo: Mecânico. Conexão: USB.', preco: 449.9, estoque: 24,
    categoriaId: 'teclados', especificacoes: { 'Modelo': 'G512 Carbon', 'Tipo': 'Mecânico', 'Conexão': 'USB' }, altaDemanda: false,
  },
  {
    id: 'g-pro-keyboard', nome: 'Logitech PRO', descricao: 'Logitech PRO. Modelo: PRO. Tipo: Mecânico. Formato: Tenkeyless.', preco: 549.9, estoque: 25,
    categoriaId: 'teclados', especificacoes: { 'Modelo': 'PRO', 'Tipo': 'Mecânico', 'Formato': 'Tenkeyless' }, altaDemanda: false,
  },
  {
    id: 'g203', nome: 'Logitech G203 LIGHTSYNC', descricao: 'Logitech G203 LIGHTSYNC. Modelo: G203 LIGHTSYNC. DPI: até 8.000. Conexão: USB.', preco: 129.9, estoque: 26,
    categoriaId: 'mouses', especificacoes: { 'Modelo': 'G203 LIGHTSYNC', 'DPI': 'até 8.000', 'Conexão': 'USB' }, altaDemanda: false,
  },
  {
    id: 'g502-x', nome: 'Logitech G502 X', descricao: 'Logitech G502 X. Modelo: G502 X. Conexão: USB. Sensor: HERO 25K.', preco: 349.9, estoque: 27,
    categoriaId: 'mouses', especificacoes: { 'Modelo': 'G502 X', 'Conexão': 'USB', 'Sensor': 'HERO 25K' }, altaDemanda: false,
  },
  {
    id: 'g-pro-wireless', nome: 'Logitech PRO Wireless', descricao: 'Logitech PRO Wireless. Modelo: PRO Wireless. Conexão: LIGHTSPEED. Sensor: HERO 25K.', preco: 599.9, estoque: 28,
    categoriaId: 'mouses', especificacoes: { 'Modelo': 'PRO Wireless', 'Conexão': 'LIGHTSPEED', 'Sensor': 'HERO 25K' }, altaDemanda: false,
  },
  {
    id: 'g335', nome: 'Logitech G335', descricao: 'Logitech G335. Modelo: G335. Conexão: 3.5mm. Peso: 240g.', preco: 299.9, estoque: 29,
    categoriaId: 'headsets', especificacoes: { 'Modelo': 'G335', 'Conexão': '3.5mm', 'Peso': '240g' }, altaDemanda: false,
  },
  {
    id: 'g435', nome: 'Logitech G435 LIGHTSPEED', descricao: 'Logitech G435 LIGHTSPEED. Modelo: G435 LIGHTSPEED. Conexão: LIGHTSPEED / Bluetooth. Peso: 165g.', preco: 349.9, estoque: 30,
    categoriaId: 'headsets', especificacoes: { 'Modelo': 'G435 LIGHTSPEED', 'Conexão': 'LIGHTSPEED / Bluetooth', 'Peso': '165g' }, altaDemanda: false,
  },
  {
    id: 'g-pro-x', nome: 'Logitech PRO X', descricao: 'Logitech PRO X. Modelo: PRO X. Conexão: USB / 3.5mm. Driver: 50mm.', preco: 649.9, estoque: 31,
    categoriaId: 'headsets', especificacoes: { 'Modelo': 'PRO X', 'Conexão': 'USB / 3.5mm', 'Driver': '50mm' }, altaDemanda: false,
  },
  {
    id: 'fury-ddr5-16-5200', nome: 'Kingston FURY Beast RGB DDR5 16GB 5200MHz', descricao: 'Kingston FURY Beast RGB DDR5 16GB 5200MHz. Capacidade: 16GB. Tipo: DDR5. Frequência: 5200MHz.', preco: 349.9, estoque: 32,
    categoriaId: 'memorias', especificacoes: { 'Capacidade': '16GB', 'Tipo': 'DDR5', 'Frequência': '5200MHz' }, altaDemanda: false,
  },
  {
    id: 'fury-ddr5-32-5600', nome: 'Kingston FURY Beast RGB DDR5 32GB 5600MHz', descricao: 'Kingston FURY Beast RGB DDR5 32GB 5600MHz. Capacidade: 32GB. Tipo: DDR5. Frequência: 5600MHz.', preco: 599.9, estoque: 33,
    categoriaId: 'memorias', especificacoes: { 'Capacidade': '32GB', 'Tipo': 'DDR5', 'Frequência': '5600MHz' }, altaDemanda: false,
  },
  {
    id: 'fury-ddr5-64-6000', nome: 'Kingston FURY Beast RGB DDR5 64GB 6000MHz', descricao: 'Kingston FURY Beast RGB DDR5 64GB 6000MHz. Capacidade: 64GB. Tipo: DDR5. Frequência: 6000MHz.', preco: 1199.9, estoque: 34,
    categoriaId: 'memorias', especificacoes: { 'Capacidade': '64GB', 'Tipo': 'DDR5', 'Frequência': '6000MHz' }, altaDemanda: false,
  },
  {
    id: 'fury-ddr4-32-3200', nome: 'Kingston FURY Beast DDR4 32GB 3200MHz', descricao: 'Kingston FURY Beast DDR4 32GB 3200MHz. Capacidade: 32GB. Tipo: DDR4. Frequência: 3200MHz.', preco: 359.9, estoque: 35,
    categoriaId: 'memorias', especificacoes: { 'Capacidade': '32GB', 'Tipo': 'DDR4', 'Frequência': '3200MHz' }, altaDemanda: false,
  },
  {
    id: 'fury-ddr4-16-3600', nome: 'Kingston FURY Beast DDR4 16GB 3600MHz', descricao: 'Kingston FURY Beast DDR4 16GB 3600MHz. Capacidade: 16GB. Tipo: DDR4. Frequência: 3600MHz.', preco: 249.9, estoque: 36,
    categoriaId: 'memorias', especificacoes: { 'Capacidade': '16GB', 'Tipo': 'DDR4', 'Frequência': '3600MHz' }, altaDemanda: false,
  },
  {
    id: 'samsung-980-pro-500gb', nome: 'SSD Samsung 980 PRO 500GB', descricao: 'SSD Samsung 980 PRO 500GB. Modelo: 980 PRO. Capacidade: 500GB. Interface: PCIe 4.0 NVMe.', preco: 349.9, estoque: 37,
    categoriaId: 'armazenamento', especificacoes: { 'Modelo': '980 PRO', 'Capacidade': '500GB', 'Interface': 'PCIe 4.0 NVMe' }, altaDemanda: false,
  },
  {
    id: 'samsung-980-pro-2tb', nome: 'SSD Samsung 980 PRO 2TB', descricao: 'SSD Samsung 980 PRO 2TB. Modelo: 980 PRO. Capacidade: 2TB. Interface: PCIe 4.0 NVMe.', preco: 999.9, estoque: 38,
    categoriaId: 'armazenamento', especificacoes: { 'Modelo': '980 PRO', 'Capacidade': '2TB', 'Interface': 'PCIe 4.0 NVMe' }, altaDemanda: false,
  },
  {
    id: 'samsung-870-evo-500gb', nome: 'SSD Samsung 870 EVO 500GB', descricao: 'SSD Samsung 870 EVO 500GB. Modelo: 870 EVO. Capacidade: 500GB. Interface: SATA III.', preco: 229.9, estoque: 39,
    categoriaId: 'armazenamento', especificacoes: { 'Modelo': '870 EVO', 'Capacidade': '500GB', 'Interface': 'SATA III' }, altaDemanda: false,
  },
  {
    id: 'samsung-870-evo-1tb', nome: 'SSD Samsung 870 EVO 1TB', descricao: 'SSD Samsung 870 EVO 1TB. Modelo: 870 EVO. Capacidade: 1TB. Interface: SATA III.', preco: 329.9, estoque: 40,
    categoriaId: 'armazenamento', especificacoes: { 'Modelo': '870 EVO', 'Capacidade': '1TB', 'Interface': 'SATA III' }, altaDemanda: false,
  },
  {
    id: 'samsung-870-evo-4tb', nome: 'SSD Samsung 870 EVO 4TB', descricao: 'SSD Samsung 870 EVO 4TB. Modelo: 870 EVO. Capacidade: 4TB. Interface: SATA III.', preco: 1299.9, estoque: 41,
    categoriaId: 'armazenamento', especificacoes: { 'Modelo': '870 EVO', 'Capacidade': '4TB', 'Interface': 'SATA III' }, altaDemanda: false,
  },
  {
    id: 'ryzen-5-7600', nome: 'AMD Ryzen 5 7600', descricao: 'AMD Ryzen 5 7600. Modelo: RYZEN 5 7600. Núcleos: 6 / 12 threads. Socket: AM5.', preco: 1299.9, estoque: 42,
    categoriaId: 'processadores', especificacoes: { 'Modelo': 'RYZEN 5 7600', 'Núcleos': '6 / 12 threads', 'Socket': 'AM5' }, altaDemanda: false,
  },
  {
    id: 'ryzen-5-5600', nome: 'AMD Ryzen 5 5600', descricao: 'AMD Ryzen 5 5600. Modelo: RYZEN 5 5600. Núcleos: 6 / 12 threads. Socket: AM4.', preco: 699.9, estoque: 43,
    categoriaId: 'processadores', especificacoes: { 'Modelo': 'RYZEN 5 5600', 'Núcleos': '6 / 12 threads', 'Socket': 'AM4' }, altaDemanda: false,
  },
  {
    id: 'ryzen-7-7700', nome: 'AMD Ryzen 7 7700', descricao: 'AMD Ryzen 7 7700. Modelo: RYZEN 7 7700. Núcleos: 8 / 16 threads. Socket: AM5.', preco: 1899.9, estoque: 44,
    categoriaId: 'processadores', especificacoes: { 'Modelo': 'RYZEN 7 7700', 'Núcleos': '8 / 16 threads', 'Socket': 'AM5' }, altaDemanda: false,
  },
  {
    id: 'ryzen-9-7900', nome: 'AMD Ryzen 9 7900', descricao: 'AMD Ryzen 9 7900. Modelo: RYZEN 9 7900. Núcleos: 12 / 24 threads. Socket: AM5.', preco: 2699.9, estoque: 10,
    categoriaId: 'processadores', especificacoes: { 'Modelo': 'RYZEN 9 7900', 'Núcleos': '12 / 24 threads', 'Socket': 'AM5' }, altaDemanda: false,
  },
  {
    id: 'lg-24gn650-b', nome: 'Monitor LG UltraGear 24GN650-B 24" 144Hz', descricao: 'Monitor LG UltraGear 24GN650-B 24" 144Hz. Modelo: 24GN650-B. Tamanho: 24". Resolução: 1920 × 1080. Taxa: 144Hz.', preco: 899.9, estoque: 11,
    categoriaId: 'monitores', especificacoes: { 'Modelo': '24GN650-B', 'Tamanho': '24"', 'Resolução': '1920 × 1080', 'Taxa': '144Hz' }, altaDemanda: false,
  },
  {
    id: 'lg-27gr75q-b', nome: 'Monitor LG UltraGear 27GR75Q-B 27" 165Hz', descricao: 'Monitor LG UltraGear 27GR75Q-B 27" 165Hz. Modelo: 27GR75Q-B. Tamanho: 27". Resolução: 2560 × 1440. Taxa: 165Hz.', preco: 1499.9, estoque: 12,
    categoriaId: 'monitores', especificacoes: { 'Modelo': '27GR75Q-B', 'Tamanho': '27"', 'Resolução': '2560 × 1440', 'Taxa': '165Hz' }, altaDemanda: false,
  },
  {
    id: 'lg-32gn600-b', nome: 'Monitor LG UltraGear 32GN600-B 32" 165Hz', descricao: 'Monitor LG UltraGear 32GN600-B 32" 165Hz. Modelo: 32GN600-B. Tamanho: 32". Resolução: 2560 × 1440. Taxa: 165Hz.', preco: 1599.9, estoque: 13,
    categoriaId: 'monitores', especificacoes: { 'Modelo': '32GN600-B', 'Tamanho': '32"', 'Resolução': '2560 × 1440', 'Taxa': '165Hz' }, altaDemanda: false,
  },
  {
    id: 'lg-27gp950-b', nome: 'Monitor LG UltraGear 27GP950-B 27" 144Hz', descricao: 'Monitor LG UltraGear 27GP950-B 27" 144Hz. Modelo: 27GP950-B. Tamanho: 27". Resolução: 3840 × 2160. Taxa: 144Hz.', preco: 3999.9, estoque: 14,
    categoriaId: 'monitores', especificacoes: { 'Modelo': '27GP950-B', 'Tamanho': '27"', 'Resolução': '3840 × 2160', 'Taxa': '144Hz' }, altaDemanda: false,
  },
  {
    id: 'asus-ap201', nome: 'Gabinete ASUS Prime AP201', descricao: 'Gabinete ASUS Prime AP201. Modelo: Prime AP201. Tipo: Gabinete para PC.', preco: 399.9, estoque: 15,
    categoriaId: 'gabinetes', especificacoes: { 'Modelo': 'Prime AP201', 'Tipo': 'Gabinete para PC' }, altaDemanda: false,
  },
  {
    id: 'asus-a21', nome: 'Gabinete ASUS A21', descricao: 'Gabinete ASUS A21. Modelo: A21. Tipo: Gabinete para PC.', preco: 449.9, estoque: 16,
    categoriaId: 'gabinetes', especificacoes: { 'Modelo': 'A21', 'Tipo': 'Gabinete para PC' }, altaDemanda: false,
  },
  {
    id: 'asus-gt301', nome: 'Gabinete ASUS TUF Gaming GT301', descricao: 'Gabinete ASUS TUF Gaming GT301. Modelo: TUF Gaming GT301. Tipo: Gabinete para PC.', preco: 549.9, estoque: 17,
    categoriaId: 'gabinetes', especificacoes: { 'Modelo': 'TUF Gaming GT301', 'Tipo': 'Gabinete para PC' }, altaDemanda: false,
  },
  {
    id: 'asus-gt502', nome: 'Gabinete ASUS TUF Gaming GT502', descricao: 'Gabinete ASUS TUF Gaming GT502. Modelo: TUF Gaming GT502. Tipo: Gabinete para PC.', preco: 999.9, estoque: 18,
    categoriaId: 'gabinetes', especificacoes: { 'Modelo': 'TUF Gaming GT502', 'Tipo': 'Gabinete para PC' }, altaDemanda: false,
  },
];

export const produtoRepository: ProdutoRepository = {
  async listar() {
    return [...produtos];
  },

  async buscarPorId(id) {
    return produtos.find((p) => p.id === id);
  },

  async criar(dados) {
    const produto: Produto = { id: randomUUID(), ...dados };
    produtos.push(produto);
    return produto;
  },

  async atualizar(id, dados) {
    const indice = produtos.findIndex((p) => p.id === id);
    if (indice === -1) return undefined;
    produtos[indice] = { id, ...dados };
    return produtos[indice];
  },

  async remover(id) {
    const indice = produtos.findIndex((p) => p.id === id);
    if (indice === -1) return false;
    produtos.splice(indice, 1);
    return true;
  },

  async contarPorCategoria(categoriaId) {
    return produtos.filter((p) => p.categoriaId === categoriaId).length;
  },

  async ajustarEstoque(id, variacao) {
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return undefined;
    produto.estoque += variacao;
    return produto;
  },
};