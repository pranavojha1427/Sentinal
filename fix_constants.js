const fs = require('fs');

const bricsStates = 
export const BRICS_STATES: Record<string, string[]> = {
  "India": [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
    "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
    "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ],
  "Brazil": [
    "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", 
    "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", 
    "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", 
    "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", 
    "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
  ],
  "Russia": [
    "Adygea", "Altai Republic", "Altai Krai", "Amur", "Arkhangelsk", "Astrakhan", 
    "Bashkortostan", "Belgorod", "Bryansk", "Buryatia", "Chechnya", "Chelyabinsk", 
    "Chukotka", "Chuvashia", "Dagestan", "Ingushetia", "Irkutsk", "Ivanovo", 
    "Jewish Autonomous Oblast", "Kabardino-Balkaria", "Kaliningrad", "Kalmykia", 
    "Kaluga", "Kamchatka", "Karachay-Cherkessia", "Karelia", "Kemerovo", "Khabarovsk", 
    "Khakassia", "Khanty-Mansi", "Kirov", "Komi", "Kostroma", "Krasnodar", 
    "Krasnoyarsk", "Kurgan", "Kursk", "Leningrad", "Lipetsk", "Magadan", 
    "Mari El", "Mordovia", "Moscow", "Moscow Oblast", "Murmansk", "Nenets", 
    "Nizhny Novgorod", "North Ossetia-Alania", "Novgorod", "Novosibirsk", "Omsk", 
    "Orenburg", "Oryol", "Penza", "Perm", "Primorsky", "Pskov", 
    "Rostov", "Ryazan", "Saint Petersburg", "Sakha (Yakutia)", "Sakhalin", 
    "Samara", "Saratov", "Smolensk", "Stavropol", "Sverdlovsk", "Tambov", 
    "Tatarstan", "Tomsk", "Tula", "Tuva", "Tver", "Tyumen", "Udmurtia", 
    "Ulyanovsk", "Vladimir", "Volgograd", "Vologda", "Voronezh", "Yamalo-Nenets", 
    "Yaroslavl", "Zabaykalsky"
  ],
  "China": [
    "Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", 
    "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", 
    "Inner Mongolia", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Ningxia", 
    "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan", 
    "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang"
  ],
  "South Africa": [
    "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", 
    "Mpumalanga", "Northern Cape", "North West", "Western Cape"
  ]
};
export const COUNTRIES = Object.keys(BRICS_STATES);
;

fs.writeFileSync('src/lib/constants.ts', bricsStates, 'utf8');

// I also need to make sure AdminInspectors has the import
let inspectors = fs.readFileSync('src/components/AdminInspectors.tsx', 'utf8');
if (!inspectors.includes('BRICS_STATES')) {
    inspectors = inspectors.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { BRICS_STATES, COUNTRIES } from "@/lib/constants";');
    fs.writeFileSync('src/components/AdminInspectors.tsx', inspectors, 'utf8');
}
