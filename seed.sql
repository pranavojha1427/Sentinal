CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_code VARCHAR(255),
    project_name TEXT,
    agency VARCHAR(255),
    state VARCHAR(255),
    original_cost NUMERIC,
    revised_cost NUMERIC,
    cumulative_expenditure NUMERIC,
    physical_progress NUMERIC
);
TRUNCATE TABLE projects;
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('612786', 'Construction of New Integrated Terminal Building and associated works including apron to park 3 code E type of aircraft or 6 code C type of aircraft at Vijayawada Airport.', 'Airport Authority of India [AAI', 'Andhra Pradesh', 
611.8, 265.91, 129.07, 65.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('701107', 'Construction of New Domestic Terminal Building at Rajahmundry Airport.', 'Airport Authority of India [AAI', 'Andhra Pradesh', 
347.15, 611.8, 523.14, 87.2);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('701121', 'Guwahati Airport New Integrated Terminal Building Construction Project', 'Adani Airport Holdings Limited', 'Andhra Pradesh', 
1712.0, 347.15, 170.79, 90.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('706724', 'Development of New Civil Enclave at Bihta', 'Airport Authority of India [AAI', 'Assam', 
1413.0, 2520.0, 2627.39, 98.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('612183', 'Development of New Civil Enclave and associated works at Darbhanga Airport', '-) (9918', 'Bihar', 
911.66, 1413.0, 7.64, 1.28);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('612194', 'Construction of New Domestic Terminal Building [Phase-I and II] and other allied structures at JPNI Airport, Patna', NULL, 'Bihar', 
1216.9, 911.66, 374.49, 65.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('701101', 'Goa Airport Terminal Building Extension Project', 'Airport Authority of India [AAI', 'Bihar', 
255.69, 1216.9, 1200.67, 98.22);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('701105', 'Development of Keshod Airport.', 'Airport Authority of India [AAI', 'Goa', 
363.1, 255.69, 156.7, 100.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('619054', 'Development of Dholera International Greenfield Airport , Gujarat', '-) (-', 'Gujarat', 
1305.0, 363.1, 87.88, 33.13);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('701126', 'Construction of NTB complex including apron, taxi track and other associated civil works and electrical & mechanical installations towards Tawi River side at CA Jammu.', NULL, 'Gujarat', 
861.37, 1551.0, 896.82, 82.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('611047', 'Construction of New Domestic Terminal Building and Miscellaneous works at Hubli Airport', 'Airport Authority of India [AAI', 'Kashmir', 
320.47, 861.37, 319.5, 51.35);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('612787', 'Construction of New Domestic Terminal Building and Miscellaneous Works at Belagavi Airport.', 'Airport Authority of India [AAI', 'Karnataka', 
322.45, 320.47, 148.68, 77.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('612788', 'Development of additional RESA on either end on Runway 10-28 at Calicut Airport. Construction of embankment with slope protection, drainage system and associated works for additional RESA on either end on Runway 10-28', 'Airport Authority of India [AAI', 'Karnataka', 
484.57, 322.45, 204.5, 87.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('612789', 'Construction of Terminal Building & Associated works at Leh Airport, Ladakh', 'Airport Authority of India [AAI', 'Kerala', 
480.0, 484.57, 204.6, 59.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400010', 'C/o NITB Imphal Airport', 'Airport Authority of India [AAI', 'Ladakh', 
499.0, 640.0, 501.81, 78.9);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('706718', 'SITC of ATM Automation System and ASMGCS [Including SMR & MLAT] for Mumbai, Navi Mumbai, Jewar [earlier MOPA, without ASMGCS], HIAL & BIAL', NULL, 'Manipur', 
500.48, 499.0, 201.99, 50.69);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('611570', 'Development of New Greenfield Airport at Bundi, Kota Rajasthan.', 'Airport Authority of India [AAI', 'Maharashtra,', 
1507.0, 500.48, 381.2, 78.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('618977', 'Construction of New Passenger Terminal Building for Domestic Operations at Jodhpur Airport.', '-) (10781', 'Rajasthan', 
480.0, 1507.0, 40.4, 12.8);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('701127', 'Construction of New Integrated Passenger Terminal Building at Udaipur Airport', 'Airport Authority of India [AAI', 'Rajasthan', 
887.0, 480.0, 339.96, 97.35);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('701128', 'Infrastructure Monitoring and Analytics for Nation-building All Ongoing Project Name Widening of basic strip at Western Side of Runway Chainage 80m to 920m i/c slope stabilization Measures [Balance work] of uphill and Improvement of Storm Water Drainage System at Pakyong Airport, Sikkim on design & build basis [EPC] with', 'Agency', 'Rajasthan', 
323.26, 887.0, 523.61, 68.71);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('612793', 'integrated 10 years maintenance. Modernization of Chennai Airport, Phase II, Part 2', 'Airport Authority of India [AAI', 'Sikkim', 
1207.0, 323.26, 80.84, 34.25);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('611602', 'Development of Lal Bahadur Shastri International airport, Varanasi including C/o New Terminal Building, Apron Extension, Runway Extension, PTT and allied works.', '-) (5163', 'Tamil Nadu', 
2869.65, 1207.0, 289.5, 38.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('701113', 'Development of New Integrated Civil Enclave at Agra Airport', 'Airport Authority of India [AAI', 'Uttar Pradesh', 
579.0, 2869.65, 572.04, 27.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('701122', 'Development of New Civil Enclave at Bagdogra Airport', 'Airport Authority of India [AAI', 'Uttar Pradesh', 
1549.0, 579.0, 197.61, 40.03);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('611495', 'Re-Construction of Rigid portions of Secondary Runway, K and A Taxiway and Strengthening of C Taxiway at NSCBI Airport Kolkata.', NULL, 'West Bengal', 
328.3, 1549.0, 441.41, 34.6);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('612791', 'Total (26) Ministry of Coal Coal TIKAK EXTENSION OCP', 'Airport Authority of India [AAI', 'West Bengal', 
21600.76, 328.3, 139.77, 64.5);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615820', 'TIRAP OCP', 'MIS MoCoal Integration Logins', 'Assam', 
289.46, 159.77, 111.47, 88.18);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615821', 'PORDA CHIMTAPANI OCP [10 MTY]', 'South Eastern Coalfields Limited [SECL', 'Assam', 
2310.12, 289.46, 105.61, 3.26);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400144', 'BAROUD OC EXPANSION [3.0-10.0M', 'South Eastern Coalfields Limited [SECL', 'Chhattisgarh', 
2309.8, 2310.12, 113.83, 11.81);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400149', 'DIPKA EXPANSION OCP [40 MTY]', 'South Eastern Coalfields Limited [SECL', 'Chhattisgarh', 
5241.4, 2309.8, 993.79, 55.95);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400354', 'GEVRA OC [70 MTY]', 'South Eastern Coalfields Limited [SECL', 'Chhattisgarh', 
11816.4, 5241.4, 2910.11, 38.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400424', 'AMERA OC RCE [1.0 MTY]', '060100093) (192', 'Chhattisgarh', 
335.97, 11816.4, 6905.46, 78.48);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('613798', 'AMGAON OC RCE [1.0 MTY]', 'South Eastern Coalfields Limited [SECL', 'Chhattisgarh', 
316.11, 335.97, 90.88, 42.47);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('613799', 'JAGANNATHPUR OC RCE PROJECT', 'South Eastern Coalfields Limited [SECL', 'Chhattisgarh', 
459.49, 316.11, 191.5, 78.86);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('613800', 'MAHAMAYA OCP [1.50 MTY]', 'South Eastern Coalfields Limited [SECL', 'Chhattisgarh', 
410.26, 459.49, 276.8, 96.15);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('613801', 'KATKONA RO UG MINE', 'South Eastern Coalfields Limited [SECL', 'Chhattisgarh', 
329.21, 410.26, 187.63, 54.6);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615191', 'PELMA OC MDO', 'South Eastern Coalfields Limited [SECL', 'Chhattisgarh', 
1725.04, 329.21, 62.03, 2.01);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616234', 'KUSMUNDA OC EXPANSION PROJECT', 'SECL - CIL', 'Chhattisgarh', 
4516.88, 1725.04, 16.71, 40.34);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('617287', 'MANIKPUR OC EXPANSION PROJECT', '-) (9611', 'Chhattisgarh', 
382.61, 4516.88, 817.06, 22.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('617288', 'RPR FOR DURGAPUR OCP 10 MTY', '-) (-', 'Chhattisgarh', 
2415.91, 382.61, 116.09, 21.29);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('619171', 'Infrastructure Monitoring and Analytics for Nation-building All Ongoing Project Name MADANNAGAR OCP 12 MTY - MDO', '-) (11842', 'Chhattisgarh', 
1859.19, 2415.91, 2.35, 0.01);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('619172', 'HURA C OCP', '-) (11856', 'Chhattisgarh', 
859.41, 1859.19, 0.45, 0.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400018', 'KONAR EXPANSION OCP', 'Ministry of Coal', 'Jharkhand', 
799.34, 859.41, 455.25, 63.22);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400073', 'KARO EXPANSION OCP', 'Ministry of Coal', 'Jharkhand', 
908.47, 799.34, 433.64, 53.47);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400074', 'SANGHMITRA OC', 'Ministry of Coal', 'Jharkhand', 
2660.0, 908.47, 289.45, 23.57);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400136', 'CHANDRAGUPT OCP', '-) (3190', 'Jharkhand', 
973.5, 2660.0, 16.1, 16.77);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400138', 'KOTRE BASANTPUR PACHMO OCP', 'Ministry of Coal', 'Jharkhand', 
861.06, 973.5, 440.75, 24.86);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400139', 'Pachwara South Coal Block', 'NLC India Limited [NLCIL', 'Jharkhand', 
2242.9, 625.4, 455.95, 47.95);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400142', 'RPR MAGADH EXP OCP', 'Ministry of Coal', 'Jharkhand', 
7254.37, 2242.9, 1365.83, 87.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400150', 'NORTH URIMARI EXPANSION OCP', 'Ministry of Coal', 'Jharkhand', 
778.8, 7254.37, 1688.4, 40.21);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400151', 'EPR ROHINI - KARKETTA OCP', 'Ministry of Coal', 'Jharkhand', 
1020.42, 778.8, 605.7, 71.38);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400153', 'EPR PUNDI OCP', 'Ministry of Coal', 'Jharkhand', 
713.35, 1020.42, 84.94, 22.84);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400154', 'EPR ASHOK OC', 'Ministry of Coal', 'Jharkhand', 
2898.28, 713.35, 236.58, 10.19);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400155', 'EPR AMRAPALI OCP', 'Ministry of Coal', 'Jharkhand', 
5136.15, 2898.28, 185.19, 28.85);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400156', 'RAJRAPPA RCE OCP', 'Ministry of Coal', 'Jharkhand', 
510.85, 5136.15, 1326.01, 44.45);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400160', 'CHITRA EAST OC', 'Eastern Coal Fields Limited [ECL', 'Jharkhand', 
513.99, 510.85, 488.71, 78.25);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400172', 'JHARKHAND-LAIYO OCP', 'Ministry of Coal', 'Jharkhand', 
764.57, 513.99, 239.88, 53.03);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400352', 'MOONIDIH XV SEAM UG', 'Bharat Coking Coal Limited (BCCL', 'Jharkhand', 
1230.27, 764.57, 145.81, 32.23);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400425', '2.5 MTPA PATHERDIH NLW WASHERY', 'Ministry of Coal', 'Jharkhand', 
334.27, 1230.27, 709.81, 82.45);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('611017', 'AMALAGAMATED NTST KUJAMA OCP 8.5MTY', 'Bharat Coking Coal Limited (BCCL', 'Jharkhand', 
4011.85, 334.27, 162.75, 51.81);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('611864', 'MURAIDIH UG PROJECT', 'Bharat Coking Coal Limited (BCCL', 'Jharkhand', 
339.87, 4011.85, 414.93, 29.7);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('613808', 'TAPIN SOUTH EXPN', 'Ministry of Coal', 'Jharkhand', 
230.41, 339.87, 191.0, 70.47);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615349', 'SIRKA OC', 'Ministry of Coal', 'Jharkhand', 
222.82, 230.41, 22.02, 22.76);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615822', 'Infrastructure Monitoring and Analytics for Nation-building All Ongoing Project Name TETARIAKHAR OC', 'Agency', 'Jharkhand', 
243.52, 222.82, 140.72, 63.52);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615843', 'CHUPERBHITA SIMLONG OCP MDO 6', 'Eastern Coal Fields Limited [ECL', 'Jharkhand', 
979.08, 243.52, 50.82, 31.27);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616225', 'JARANGDIH EXPN. OCP 1.5 MTY', 'CCL - CIL', 'Jharkhand', 
414.37, 979.08, 0.0, 0.05);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616236', 'BLOCK E OCP', 'Ministry of Coal', 'Jharkhand', 
5850.83, 414.37, 85.6, 34.18);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616253', 'Revised Jharia Master Plan for Dealing with Fire, Subsidence & Rehabilitation of affected families in Jharia Coalfield- Reg.', NULL, 'Jharkhand', 
5940.47, 5850.83, 20.32, 4.17);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('617416', 'North Dhadu Western Part OCP', 'Bharat Coking Coal Limited [BCCL', 'Jharkhand', 
1354.2, 5940.47, 262.83, 26.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('617764', 'AMADAND OCP[4.0MTY]', '-) (9968', 'Jharkhand', 
869.44, 1354.2, 141.98, 40.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400148', 'BLOCK B EXPANSION [3.5 TO 8.0', 'Northern Coalfields Limited [NCL', 'Madhya Pradesh', 
998.71, 869.44, 325.4, 75.15);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400162', 'NIGAHI EXPANSION [15 TO 25 MTP', 'Northern Coalfields Limited [NCL', 'Madhya Pradesh', 
1729.68, 998.71, 518.17, 50.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400321', 'KANCHAN OC EXP', 'South Eastern Coalfields Limited [SECL', 'Madhya Pradesh', 
371.04, 1729.68, 929.02, 48.76);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('613802', 'JHIRIA WEST OCP [1.5 MTY]', 'South Eastern Coalfields Limited [SECL', 'Madhya Pradesh', 
366.94, 371.04, 148.87, 58.2);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('613803', 'RPR TAWA-III UG 0.84 MTY', 'Western Coalfields Limited [WCL', 'Madhya Pradesh', 
314.09, 366.94, 35.57, 41.29);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('613804', 'AMALGAMATED DHANKASA & JAMUNIA', 'Western Coalfields Limited [WCL', 'Madhya Pradesh', 
399.2, 314.09, 17.89, 17.78);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615185', 'RPR OF VISHNUPURI UG TO OC', 'Western Coalfields Limited [WCL', 'Madhya Pradesh', 
220.62, 399.2, 100.03, 67.13);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615187', 'URDHAN EXPANSION OC COST PLUS', 'Western Coalfields Limited [WCL', 'Madhya Pradesh', 
206.88, 220.62, 0.0, 11.2);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615194', 'SHARDA UG MINE', 'Western Coalfields Limited [WCL', 'Madhya Pradesh', 
166.25, 206.88, 27.32, 2.02);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615195', 'GANDHIGRAM UG MINE', 'Western Coalfields Limited [WCL', 'Madhya Pradesh', 
414.15, 166.25, 5.19, 9.39);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615206', 'JAYANT EXPN. [20 TO 38 MTPA]', 'Northern Coalfields Limited [NCL', 'Madhya Pradesh', 
25560.48, 414.15, 22.11, 56.88);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('619032', 'RPR FOR RAMPUR BATURA OCP', '-) (11593', 'Madhya Pradesh', 
1604.69, 25560.5, 126.68, 1.32);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('619053', 'BHATADI EXPANSION OC', '-) (11612', 'Madhya Pradesh', 
580.61, 1604.69, 74.71, 0.3);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400033', 'AMALGAMATED YEKONA I & YEKONA', 'Western Coalfields Limited [WCL', 'Maharashtra', 
727.28, 580.61, 112.17, 33.91);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400177', 'DINESH[MAKARDHOKRA-III] OC', 'Western Coalfields Limited [WCL', 'Maharashtra', 
822.88, 727.28, 563.25, 80.77);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400178', 'Infrastructure Monitoring and Analytics for Nation-building All Ongoing Project Name DHUPTALA OC [SASTI UG TO OC ]', 'Agency', 'Maharashtra', 
711.01, 822.88, 652.67, 40.54);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400353', 'SAONER UG MINE -1 EXPANSION 1.', 'Western Coalfields Limited [WCL', 'Maharashtra', 
228.64, 711.01, 174.62, 19.02);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615184', 'SASTI EXPANSION OPENCAST', 'Western Coalfields Limited [WCL', 'Maharashtra', 
319.04, 228.64, 150.47, 69.33);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615186', 'NEW MAJRI UG TO OC 3 MTY COST', 'Western Coalfields Limited [WCL', 'Maharashtra', 
402.27, 319.04, 111.17, 32.21);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615188', 'MAKARDHOKRA EXPN OC 4.9 MTY', 'Western Coalfields Limited [WCL', 'Maharashtra', 
361.87, 402.27, 67.11, 24.17);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615189', 'SINGHORI DEEP OC MIN 2.0 MTY', 'Western Coalfields Limited [WCL', 'Maharashtra', 
335.75, 361.87, 96.64, 12.2);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615190', 'GOKUL EXTENSION OC MINE', 'Western Coalfields Limited [WCL', 'Maharashtra', 
309.58, 335.75, 49.75, 9.57);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615192', 'KOLGAON EXPANSION DEEP OC MINE', 'Western Coalfields Limited [WCL', 'Maharashtra', 
198.71, 309.58, 57.46, 8.44);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615199', 'BALLARPUR NORTH WEST OC MINE', 'Western Coalfields Limited [WCL', 'Maharashtra', 
360.81, 198.71, 23.54, 2.82);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615330', 'GADEGAON OC 3 MTY', 'Western Coalfields Limited [WCL', 'Maharashtra', 
497.41, 360.81, 3.84, 5.17);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615331', 'GHONSA EXPANSION DEEP OC MINE', '-) (-', 'Maharashtra', 
184.71, 497.41, 27.55, 2.19);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615914', 'AMLG GAURI PAUNI EXPANSION OC', 'Western Coalfields Limited [WCL', 'Maharashtra', 
1225.21, 184.71, 15.72, 12.83);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615916', 'GAURIDEEP/GAURI CENTRAL OCP 7.', 'Western Coalfields Limited [WCL', 'Maharashtra', 
973.07, 1225.21, 88.88, 4.21);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615917', 'RPR OF BHANEGAON OC', 'Western Coalfields Limited [WCL', 'Maharashtra', 
405.2, 973.07, 1.55, 2.31);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615918', 'N. EXTN. MUNGOLI NIRGUDA D OCP', 'Western Coalfields Limited [WCL', 'Maharashtra', 
1024.91, 405.2, 35.03, 15.95);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615919', 'NILJAI EXPANSION DEEP OCP', 'Western Coalfields Limited [WCL', 'Maharashtra', 
319.75, 1024.91, 217.01, 27.92);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615982', 'UKNI DEEP OC MINE -COST PLUS', 'Western Coalfields Limited [WCL', 'Maharashtra', 
237.06, 319.75, 196.86, 79.83);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616044', 'AMALGAMATED INDER-KAMPTEE DEEP', 'Western Coalfields Limited [WCL', 'Maharashtra', 
235.9, 237.06, 166.87, 93.51);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616050', 'ADASA UG TO OC MINE', 'Western Coalfields Limited [WCL', 'Maharashtra', 
316.0, 235.9, 127.42, 98.97);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616223', 'AMAL GONDEGAON GHATROHANA EXPN', 'Western Coalfields Limited [WCL', 'Maharashtra', 
668.54, 316.0, 209.35, 86.49);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616229', 'WAGHODA UG MINE [1.02 MTY]', 'Western Coalfields Limited [WCL', 'Maharashtra', 
379.3, 668.54, 2.94, 2.52);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('617233', 'KOLARPIMPRI EXPANSION OC [2.5', 'Western Coalfields Limited [WCL', 'Maharashtra', 
630.37, 379.3, 0.0, 0.01);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('617278', 'SAONER-III EXPN UG MINE 1.54', 'Western Coalfields Limited [WCL', 'Maharashtra', 
444.42, 630.37, 0.61, 0.35);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('619055', 'Infrastructure Monitoring and Analytics for Nation-building All Ongoing Project Name BINA KAKRI AMALGAMATION EXPANS', '-) (-', 'Maharashtra', 
836.42, 444.42, 0.0, 0.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400369', 'KHADIA EXPANSION [10 TO 16 MTP', 'Northern Coalfields Limited [NCL', '(Madhya Pradesh,', 
491.67, 836.42, 835.34, 89.9);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615183', 'SUBHADRA OCP', 'Mahanadi Coalfields Limited [MCL', '(Madhya Pradesh,', 
1693.81, 491.67, 276.75, 55.57);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400165', 'SIARMAL OCP', 'Mahanadi Coalfields Limited [MCL', 'Odisha', 
5194.95, 1693.81, 1329.14, 45.57);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400166', 'BALARAM EXPANSION OCP', 'Mahanadi Coalfields Limited [MCL', 'Odisha', 
3504.21, 5194.95, 3490.38, 59.5);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400183', 'GOPALJI KANIHA OCP [10 TO 30 M', 'MCL - CIL', 'Odisha', 
8416.19, 3504.21, 958.0, 57.15);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400185', 'INTEGRATED LAKHANPUR-BELPAHAR-', 'Mahanadi Coalfields Limited [MCL', 'Odisha', 
2434.75, 6107.87, 1771.98, 34.54);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400187', 'BHARATPUR RE-ORGANIZATION OCP', 'Mahanadi Coalfields Limited [MCL', 'Odisha', 
2838.86, 2434.75, 2002.75, 79.05);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400392', 'BASUNDHARA WEST EXTENSION OPEN', 'MCL - CIL', 'Odisha', 
479.15, 2838.86, 1711.38, 52.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615193', 'Naini Coal Mine', 'Singareni Collieries Company Limited [SCCL', 'Odisha', 
494.3, 479.15, 281.57, 67.58);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615857', 'INTEGRATED KULDA GARJANBAHAL O', 'Mahanadi Coalfields Limited [MCL', 'Odisha', 
3563.5, 494.3, 491.33, 80.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616226', 'BHUBANESWARI EXPN OCP 50 MTY', 'MCL - CIL', 'Odisha', 
5366.27, 3563.5, 672.78, 6.18);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616231', 'HINGULA II OC EXPN PH III 15 M', 'MCL - CIL', 'Odisha', 
1561.85, 5366.27, 477.39, 32.47);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616232', 'BALABHADRA OCP', 'MCL - CIL', 'Odisha', 
978.44, 1561.85, 279.32, 29.19);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('616233', 'Talabira II & III OCP - FMC', 'NLC India Limited [NLCIL', 'Odisha', 
522.45, 978.44, 251.55, 15.24);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('618982', 'Jawahar Khani Open Cast Mine', '-) (10777', 'Odisha', 
297.88, 522.45, 324.74, 72.65);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615818', 'Kalyanikhani Opencast Project', 'Singareni Collieries Company Limited [SCCL', 'Telangana', 
384.32, 297.88, 47.48, 20.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615858', 'Godavarikhani Coal Mine - 5', 'Singareni Collieries Company Limited [SCCL', 'Telangana', 
607.04, 384.32, 291.01, 75.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615860', 'Indaram Opencast Project', 'Singareni Collieries Company Limited [SCCL', 'Telangana', 
424.81, 607.04, 200.06, 71.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615861', 'Goleti Opencast Mine', 'Singareni Collieries Company Limited [SCCL', 'Telangana', 
345.6, 424.81, 406.81, 81.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615862', 'Venkatesh Khani Coal Mine', 'Singareni Collieries Company Limited [SCCL', 'Telangana', 
484.5, 345.6, 111.15, 32.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615863', 'Kakatiyakhani OC - 2 Project', 'Singareni Collieries Company Limited [SCCL', 'Telangana', 
442.42, 484.5, 477.14, 97.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('615865', 'MOHANPUR EXPANSION OC -PHASE I', 'Eastern Coal Fields Limited [ECL', 'Telangana', 
888.99, 442.42, 252.26, 63.0);
INSERT INTO projects (
    project_code, project_name, agency, state, 
    original_cost, revised_cost, cumulative_expenditure, physical_progress
) VALUES ('400173', 'Infrastructure Monitoring and Analytics for Nation-building', NULL, 'West Bengal', 
NULL, 888.99, 142.55, 31.52);
