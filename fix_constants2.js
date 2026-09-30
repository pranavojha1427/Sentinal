const fs = require('fs');

const bricsStates = 'export const BRICS_STATES: Record<string, string[]> = {\n' +
  '  "India": [\n' +
  '    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",\n' +
  '    "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",\n' +
  '    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",\n' +
  '    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",\n' +
  '    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",\n' +
  '    "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",\n' +
  '    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"\n' +
  '  ],\n' +
  '  "Brazil": [\n' +
  '    "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",\n' +
  '    "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",\n' +
  '    "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",\n' +
  '    "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",\n' +
  '    "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"\n' +
  '  ],\n' +
  '  "Russia": [\n' +
  '    "Adygea", "Altai Republic", "Altai Krai", "Amur", "Arkhangelsk", "Astrakhan",\n' +
  '    "Bashkortostan", "Belgorod", "Bryansk", "Buryatia", "Chechnya", "Chelyabinsk",\n' +
  '    "Chukotka", "Chuvashia", "Dagestan", "Ingushetia", "Irkutsk", "Ivanovo",\n' +
  '    "Jewish Autonomous Oblast", "Kabardino-Balkaria", "Kaliningrad", "Kalmykia",\n' +
  '    "Kaluga", "Kamchatka", "Karachay-Cherkessia", "Karelia", "Kemerovo", "Khabarovsk",\n' +
  '    "Khakassia", "Khanty-Mansi", "Kirov", "Komi", "Kostroma", "Krasnodar",\n' +
  '    "Krasnoyarsk", "Kurgan", "Kursk", "Leningrad", "Lipetsk", "Magadan",\n' +
  '    "Mari El", "Mordovia", "Moscow", "Moscow Oblast", "Murmansk", "Nenets",\n' +
  '    "Nizhny Novgorod", "North Ossetia-Alania", "Novgorod", "Novosibirsk", "Omsk",\n' +
  '    "Orenburg", "Oryol", "Penza", "Perm", "Primorsky", "Pskov",\n' +
  '    "Rostov", "Ryazan", "Saint Petersburg", "Sakha (Yakutia)", "Sakhalin",\n' +
  '    "Samara", "Saratov", "Smolensk", "Stavropol", "Sverdlovsk", "Tambov",\n' +
  '    "Tatarstan", "Tomsk", "Tula", "Tuva", "Tver", "Tyumen", "Udmurtia",\n' +
  '    "Ulyanovsk", "Vladimir", "Volgograd", "Vologda", "Voronezh", "Yamalo-Nenets",\n' +
  '    "Yaroslavl", "Zabaykalsky"\n' +
  '  ],\n' +
  '  "China": [\n' +
  '    "Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi",\n' +
  '    "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan",\n' +
  '    "Inner Mongolia", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Ningxia",\n' +
  '    "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan",\n' +
  '    "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang"\n' +
  '  ],\n' +
  '  "South Africa": [\n' +
  '    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",\n' +
  '    "Mpumalanga", "Northern Cape", "North West", "Western Cape"\n' +
  '  ]\n' +
  '};\n' +
  'export const COUNTRIES = Object.keys(BRICS_STATES);\n';

fs.writeFileSync('src/lib/constants.ts', bricsStates, 'utf8');

// I also need to make sure AdminInspectors has the import
let inspectors = fs.readFileSync('src/components/AdminInspectors.tsx', 'utf8');
if (!inspectors.includes('BRICS_STATES')) {
    inspectors = inspectors.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { BRICS_STATES, COUNTRIES } from "@/lib/constants";');
    fs.writeFileSync('src/components/AdminInspectors.tsx', inspectors, 'utf8');
}
