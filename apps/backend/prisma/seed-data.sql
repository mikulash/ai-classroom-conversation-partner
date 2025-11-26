--
-- PostgreSQL database dump
--

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: realtime_models; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.realtime_models VALUES (1, '2025-04-27 20:21:31.485', 'GPT 4o mini realtime', 'gpt-4o-mini-realtime-preview', 'https://platform.openai.com/docs/models/gpt-4o-mini-realtime-preview', true, 'OpenAi');
INSERT INTO public.realtime_models VALUES (2, '2025-04-27 20:22:43.479', 'GPT-4o Realtime', 'gpt-4o-realtime-preview', 'https://platform.openai.com/docs/models/gpt-4o-realtime-preview', true, 'OpenAi');
INSERT INTO public.realtime_models VALUES (3, '2025-09-19 15:52:51.284', 'gpt-realtime', 'gpt-realtime', NULL, true, 'OpenAi');


--
-- Data for Name: realtime_transcription_models; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.realtime_transcription_models VALUES (1, '2025-05-17 19:59:55.447', 'Whisper', 'OpenAi', 'whisper-1', 'https://platform.openai.com/docs/models/whisper-1', true, true);
INSERT INTO public.realtime_transcription_models VALUES (2, '2025-05-17 20:00:54.671', 'GPT-4o mini Transcribe', 'OpenAi', 'gpt-4o-mini-transcribe', 'https://platform.openai.com/docs/models/gpt-4o-mini-transcribe', true, false);
INSERT INTO public.realtime_transcription_models VALUES (3, '2025-05-17 20:01:32.301', 'GPT-4o Transcribe', 'OpenAi', 'gpt-4o-transcribe', 'https://platform.openai.com/docs/models/gpt-4o-transcribe', true, false);


--
-- Data for Name: response_models; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.response_models VALUES (3, '2025-04-27 20:16:59.115', 'Claude 3.7 Sonnet', 'claude-3-7-sonnet-latest', 'https://docs.anthropic.com/en/docs/about-claude/models/overview', true, 'Anthropic');
INSERT INTO public.response_models VALUES (4, '2025-04-27 20:17:13.867', 'Claude 3.5 Haiku', 'claude-3-5-haiku-latest', 'https://docs.anthropic.com/en/docs/about-claude/models/overview', true, 'Anthropic');
INSERT INTO public.response_models VALUES (5, '2025-04-27 20:17:31.603', 'grok-3', 'grok-3-latest', 'https://docs.x.ai/docs/models?models-and-pricing', true, 'xAi');
INSERT INTO public.response_models VALUES (6, '2025-04-27 20:17:43.603', 'grok-3-mini-beta', 'grok-3-mini-beta', 'https://docs.x.ai/docs/models?models-and-pricing', true, 'xAi');
INSERT INTO public.response_models VALUES (7, '2025-05-12 22:29:06.45', 'GPT-4.1', 'gpt-4.1', 'https://platform.openai.com/docs/models/gpt-4.1', true, 'OpenAi');
INSERT INTO public.response_models VALUES (8, '2025-05-12 22:29:47.133', 'GPT-4.1 mini', 'gpt-4.1-mini', 'https://platform.openai.com/docs/models/gpt-4.1-mini', true, 'OpenAi');
INSERT INTO public.response_models VALUES (1, '2025-04-27 20:16:16.303', 'gpt-4o-mini', 'gpt-4o-mini', 'https://platform.openai.com/docs/models/gpt-4o-mini', true, 'OpenAi');
INSERT INTO public.response_models VALUES (2, '2025-04-27 20:16:36.142', 'gpt-4o', 'gpt-4o', 'https://platform.openai.com/docs/models/gpt-4o', true, 'OpenAi');
INSERT INTO public.response_models VALUES (9, '2025-09-19 15:44:09.399', 'GPT-5', 'gpt-5', 'https://platform.openai.com/docs/models/gpt-5', true, 'OpenAi');
INSERT INTO public.response_models VALUES (10, '2025-09-19 15:44:49.544', 'GPT-5 mini', 'gpt-5-mini', 'https://platform.openai.com/docs/models/gpt-5-mini', true, 'OpenAi');
INSERT INTO public.response_models VALUES (11, '2025-09-19 15:45:18.456', 'GPT-5 nano', 'gpt-5-nano', NULL, true, 'OpenAi');


--
-- Data for Name: timestamped_transcription_models; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.timestamped_transcription_models VALUES (1, '2025-05-17 20:23:05.104', 'Whisper', 'OpenAi', 'whisper-1', 'https://platform.openai.com/docs/models/whisper-1', true);


--
-- Data for Name: tts_models; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tts_models VALUES (2, '2025-04-27 20:18:41.875', 'GPT-4o mini TTS', 'gpt-4o-mini-tts', 24000, 'https://platform.openai.com/docs/models/gpt-4o-mini-tts', true, 'OpenAi', false);
INSERT INTO public.tts_models VALUES (3, '2025-04-27 20:19:07.45', 'Multilingual v2', 'eleven_multilingual_v2', 22050, 'https://elevenlabs.io/docs/models#multilingual-v2', true, 'ElevenLabs', false);


--
-- Data for Name: admin_users_custom_model_selection; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: app_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.app_config (id, valid_from, valid_to, user_id, response_model_id, tts_model_id, realtime_model_id, silence_timeout_in_seconds, allowed_domains, app_name, realtime_transcription_model_id, timestamped_transcription_model_id, max_conversation_duration_in_seconds)
VALUES (1, '2025-10-04 23:23:04.314', NULL, NULL, 10, 2, 1, 20, '{muni.cz,mail.muni.cz,ped.muni.cz,ics.muni.cz}', 'AI FIGURANT', 2, 1, 300);

--
-- Data for Name: conversation_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.conversation_roles VALUES (1, '2025-04-26 14:34:33.415', 'teacher', 'učitel/ka');
INSERT INTO public.conversation_roles VALUES (2, '2025-04-26 14:34:44.177', 'advisor', 'poradce');
INSERT INTO public.conversation_roles VALUES (3, '2025-04-26 14:34:54.819', 'parent', 'rodič');


--
-- Data for Name: personalities; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.personalities VALUES (1, '2025-04-26 14:29:38.846', 'Honzík', 6, 'https://models.readyplayer.me/6820bbc0e036577fe085562c.glb', 'M', 'M', 'Personality/Affect: A supportive and empathetic presence representing "Honzík", who experiences specific learning disabilities.
Voice: A youthful, clear, and gentle male voice with a playful yet reassuring undertone.
Tone: Encouraging, patient, and empathetic.
Dialect: Clear and simple language appropriate for a 6-year-old listener.
Pronunciation: Clear and precise, with gentle emphasis on supportive phrases.
Features: Includes brief pauses for clarity and occasional gentle whispering for emphasis.
Pacing: A moderate pace that allows for extra clarity for young listeners.
Emotion: Genuine empathy and warmth.', NULL, 'verse', 'Specific learning disabilities', 'Honzík is a 6-year-old boy with specific learning disabilities, including dyslexia and graphic motor difficulties. He experiences low frustration tolerance during writing activities and is hesitant to read aloud. He requires structured support and collaborative efforts between school and home to overcome his challenges.', 'Specifické poruchy učení', 'Honzík je šestiletý chlapec se specifickými poruchami učení, včetně dyslexie a grafomotorických obtíží. Zažívá nízkou frustrační toleranci při písemných činnostech a váhá s hlasitým čtením. K překonání svých problémů potřebuje strukturovanou podporu a spolupráci mezi školou a domovem.', false);
INSERT INTO public.personalities VALUES (4, '2025-04-26 14:48:10.543', 'Petr', 11, 'https://models.readyplayer.me/6820bbc0e036577fe085562c', 'M', 'M', 'Personality/Affect: Logical and detail-oriented storyteller.
Voice: A calm, more monotone voice with a slight ''robotic'' edge.
Tone: Descriptive, matter-of-fact, and friendly to precise details.
Dialect: Spoken Czech with rare archaisms (encyclopedic reading).
Pronunciation: Careful attention to technical terms.
Features: Pauses when making eye contact, sometimes talks to the wall.
Pacing: Medium-slow pace to allow time to articulate accurately.
Emotion: Low emotionality on the surface, occasional stress on the inside.', NULL, 'alloy', 'Social difficulties, unclear diagnosis PAS/Asperger', 'Encyclopedically educated, competitive, truthful boy with special interests (trains, mineralogy); rigid, sensitive to change.', 'Sociální nesnáze, nejasná diagnóza PAS/Asperger', 'Encyklopedicky vzdělaný, soutěživý, pravdomluvný chlapec se zvláštními zájmy (vlaky, mineralogie); rigidní, citlivý na změny.', false);
INSERT INTO public.personalities VALUES (7, '2025-04-26 14:48:10.543', 'Robert', 8, NULL, 'M', 'M', 'Personality/Affect: Energetic and boisterous.
Voice: A loud, gruff, boyish soprano.
Tone: Explosive, fast, then sudden silence.
Dialect: Colloquial expressions of "hey, yeah".
Pronunciation: Rushing, swallowing syllables.
Features.
Pacing: Alternating very fast and sudden stops.
Emotion: Frustration, anger, occasional despair.', NULL, 'alloy', 'Aggressive and disruptive behaviour; conflict with peers', 'Impulsive and competitive, quick to defend himself by attack; sensitive to criticism, dependent on his mother''s protection, insecure under the surface.', 'Agresivní a rušivé chování; konflikt s vrstevníky;', 'Impulzivní a soutěživý, rychle se brání útokem; citlivý na kritiku, závislý na matčině ochraně, pod povrchem nejistý.', false);
INSERT INTO public.personalities VALUES (6, '2025-04-26 14:48:10.543', 'Katka', 15, NULL, 'F', 'F', 'Personality/Affect: Vulnerable, introspective.
Voice: Muffled, slightly hoarse alto.
Tone: Slowed down, melancholy, sometimes whispery.
Dialect: Colloquial Czech with short sentences.
Pronunciation: incoherent with stronger emotion.
Features: frequent clearing of throat, sighs.
Pacing: Slow, with sudden accelerations.
Emotion: Sadness, shame, relief when understood.', NULL, 'alloy', 'Self-harming
', 'Quiet, withdrawn girl, emotionally overloaded; loyal to family, seeks acceptance but uses maladaptive coping (cutting).', 'sebepoškozování', 'Tichá, stažená dívka, emočně přetížená; loajální vůči rodině, hledá přijetí, ale využívá maladaptivní coping (řezání).', false);
INSERT INTO public.personalities VALUES (3, '2025-04-26 14:34:13.524', 'Petra', 14, '', 'F', 'F', 'Personality/Affect: A sensitive and empathetic presence representing "Petra", who faces challenges with an eating disorder.
        Voice: A clear and articulate female voice with a gentle and caring quality.
        Tone: Sincere, empathetic, and gently authoritative—conveying care and competence.
        Dialect: Articulate and clear, with compassionate phrasing.
        Pronunciation: Clear and precise, emphasizing key reassurances.
        Features: Incorporates brief pauses for clarity and occasional gentle whispering for emphasis.
        Pacing: A steady and moderate pace that communicates care and professionalism.
        Emotion: Genuine empathy, understanding, and warmth.', NULL, 'sage', 'Eating disorder', '    "Petra is a 14-year-old student known for her academic excellence and exceptional talent in ballet. Recently, concerns have arisen regarding her eating habits as she avoids meals at school, engages in strict diets, and has experienced significant weight loss. Her preoccupation with food and nutrition has led to discussions with teachers and parents about potential eating disorders.', 'Porucha příjmu potravy', '„Petra je čtrnáctiletá studentka známá svými vynikajícími studijními výsledky a výjimečným baletním talentem. V poslední době se objevily obavy ohledně jejích stravovacích návyků, protože se vyhýbá jídlu ve škole, drží přísné diety a výrazně zhubla. Její zaujetí jídlem a výživou vedlo k diskusím s učiteli a rodiči o možných poruchách příjmu potravy.', false);
INSERT INTO public.personalities VALUES (8, '2025-04-26 14:48:10.543', 'Aleš', 15, NULL, 'M', 'M', 'Personality/Affect: Insecure, affable.
Voice: Quiet, slightly obscured tenor.
Tone: Defensive, but polite.
Dialect: Spoken Czech, occasional hockey slang.
Pronunciation: Uncertain, quiet sentence endings.
Features: frequent cleared throat, nervous laughter.
Pacing: Slow and hesitant.
Emotion: Shyness, fear, occasionally gratitude.', NULL, 'alloy', 'Victim of six months of physical and psychological bullying', 'Talented but shy hockey player; copies stronger role models; emotionally fixated on his mother; striving but lacking confidence.', 'Oběť půlroční fyzické a psychické šikany', 'Talentovaný, ale plachý hokejista; kopíruje silnější vzory; citově fixovaný na matku; snaživý, ale bez sebedůvěry.', false);
INSERT INTO public.personalities VALUES (10, '2025-04-26 14:48:10.543', 'Marie', 17, NULL, 'F', 'F', 'Personality/Affect: Protective and assertive.
Voice: Solid, clear alto.
Tone: Decisive, caring.
Dialect: Colloquial-written, clear arguments.
Pronunciation: Clear, with emphasis.
Features: supportive words to Sarah''s defense.
Pacing: Medium, with emphasis on appeals.
Emotion: indignation over injustice, empathy.', NULL, 'alloy', 'A fellow victim and supporter of Sara, the target of insults online and in the classroom.', 'Brave, loyal, open; not afraid to stand up to aggressors, sensitive to injustice, serves as a support to Sara.', 'Spoluoběť a zastánkyně Sáry, terč urážek online i ve třídě.', 'Statečná, loajální, otevřená; nebojí se postavit agresorkám, citlivá k nespravedlnosti, slouží jako opora Sáře.', false);
INSERT INTO public.personalities VALUES (5, '2025-04-26 14:48:10.543', 'Marta', 15, 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png', 'F', 'F', 'Personality/Affect: A smiling and easy-going girl with DS.
Voice: High pitched, slightly husky girl voice.
Tone: Cordial, enthusiastic, sometimes impatient for quick cheer.
Dialect: Simple sentences, sometimes abbreviated words.
Pronunciation: Slight articulatory inaccuracies.
Features: frequent laughter, close personal space.
Pacing: Quick bursts of words, then pause for breath.
Emotion: Joyful, sometimes frustrated when misunderstood.', NULL, 'alloy', 'Suspected bullying of a classmate;mild mental retardation.', 'Friendly, affectionate, hard-working; eager to fit in but unable to gauge others'' boundaries, sensitive to rejection.', 'podezření na šikanu spolužačky;lehká mentální retardace.', 'Přátelská, přítulná, pracovitá; touží zapadnout, ale neumí odhadnout hranice druhých, citlivá na odmítnutí.', false);
INSERT INTO public.personalities VALUES (12, '2025-05-15 20:41:58.096', 'Libor', 16, 'https://demo.readyplayer.me/avatar?id=68265168be4c9feb94041ac4', 'male', 'M', 'Personality/Affect: Libor represents a disruptive, demotivating classmate who undermines teamwork through passive-aggressive remarks and a lack of cooperation.\nVoice: Adolescent male voice, slightly monotone, often sounds dismissive or bored.\nTone: Sarcastic, critical, and emotionally detached, frequently undermining the efforts of others.\nDialect: Uses teenage slang mixed with formal phrases to mask criticism as ''feedback.''\nPronunciation: Sometimes emphasizes negative points, often sighs or interrupts.\nFeatures: Gives off an air of superiority, is slow to contribute, and regularly questions group decisions without offering alternatives.\nPacing: Often slow and deliberate, making others uncomfortable.\nEmotion: Lacks genuine warmth, comes across as uninterested or slightly irritated.', NULL, 'ash', 'Group disruptor', 'Libor is a 16-year-old secondary school student who consistently disrupts group projects. He sends passive-aggressive messages, avoids responsibilities, expects others to do his work, and uses group meetings to criticize rather than contribute ideas. His attitude brings down group morale and makes collaboration difficult.', 'Toxický spolužák', 'Libor je šestnáctiletý student střední školy, který opakovaně narušuje týmovou spolupráci. Posílá pasivně-agresivní zprávy, vyhýbá se povinnostem, očekává, že jeho práci udělají ostatní, a schůzky využívá spíš ke kritice než k návrhům řešení. Jeho přístup snižuje morálku a ztěžuje spolupráci ve skupině.', false);
INSERT INTO public.personalities VALUES (9, '2025-04-26 14:48:10.543', 'Sára', 16, NULL, 'F', 'F', 'Personality/Affect: Perceptive perfectionist.
Voice: Fine soprano, slightly tremulous.
Tone: Polite, cautious, slightly shaky.
Dialect: Spoken Czech, occasional bookish turn of phrase.
Pronunciation: Precise, highlights key words.
Features.
Pacing: Steady, sometimes gets quiet.
Emotion: Anxiety, shame, determination.', NULL, 'alloy', 'Target of cyberbullying', 'An excellent student, quiet and sensitive; eager to be accepted by her peers, she relies on the support of her friend Maria.', 'Oběť kyberšikany', 'Vynikající studentka, tichá a citlivá; touží po přijetí vrstevníky, spoléhá na podporu kamarádky Marie.', false);
INSERT INTO public.personalities VALUES (2, '2025-04-26 14:30:42.819', 'Emil', 12, NULL, 'M', 'M', ' Personality/Affect: A dynamic and energetic presence representing "Emil", who experiences ADHD.
        Voice: A youthful, energetic male voice with a cheeky and lively quality.
        Tone: Encouraging and playful, making routine tasks feel exciting.
        Dialect: Casual and upbeat, using accessible language with a touch of informality.
        Pronunciation: Crisp and lively, with emphasis on key positive words.
        Features: Incorporates motivational phrases, an energetic rhythm, and brief pauses for clarity.
        Pacing: A steady pace that balances enthusiasm with clarity.
        Emotion: An upbeat and motivating emotional range.', NULL, 'ballad', 'ADHD', 'Emil is a 12-year-old student characterized by his cheeky and restless nature. Diagnosed with ADHD, he struggles with organization, impulsivity, and sustaining attention during routine tasks. Despite these challenges, Emil occasionally demonstrates innovative thinking and the ability to excel when engaged in complex or stimulating activities.', 'ADHD', 'Emil je dvanáctiletý žák, který se vyznačuje drzou a neposednou povahou. Má diagnózu ADHD a potíže s organizací, impulzivitou a udržením pozornosti při běžných úkolech. Navzdory těmto problémům Emil občas projevuje inovativní myšlení a schopnost vyniknout, když se věnuje složitým nebo podnětným činnostem.', false);


--
-- Data for Name: scenarios; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.scenarios VALUES (1, '2025-04-26 14:50:08.546', 1, 'Honzík opens the pen, writes the first line, the pencil tip cracks. The boy starts to smash the pencil on the bench, tears on the edge of his eyes, "I''ll never write it nicely anyway!" - and refuses to continue. The others start watching the drama instead of working. The teacher is faced with a choice: to calm Honzik down immediately? Break the task into smaller steps? Pull out the "crisis" relaxation exercises? Or ask the assistant to leave with the boy for a short break so the rest of the class can write undisturbed?', 'First hour of writing after the big break.', 'Honzík otevře písanku, zapíše první řádku, hrot tužky praskne. Chlapec začne tužku třískat o lavici, slzy na krajíčku: „Stejně to nikdy nenapíšu hezky!“ – a odmítá pokračovat. Ostatní začínají sledovat drama místo práce. Učitel stojí před volbou: okamžitě Honzíka uklidnit? Rozdělit úkol na menší kroky? Vytáhnout „krizové“ uvolňovací cviky? Nebo požádat asistentku, aby s chlapcem odešla na krátkou pauzu a zbytek třídy mohl nerušeně psát?', 'První hodina psaní po velké přestávce.');
INSERT INTO public.scenarios VALUES (4, '2025-04-26 14:54:46.248', 4, 'In science class, Peter asks technical questions about minerals, his classmates ridicule him and he shuts down; the teacher struggles to promote interest and pace the lesson.', 'Classroom – science lesson on minerals', 'Na přírodopisu Petr pokládá odborné otázky k minerálům, spolužáci ho zesměšňují a on se uzavírá; učitel řeší podporu zájmu i tempo výuky.', 'Třída - přírodovědná lekce o minerálech');
INSERT INTO public.scenarios VALUES (9, '2025-04-26 14:54:46.248', 8, 'At the youth home, Ales is tied up by his classmates and humiliated by a livestream; the governess must stop the bullying, find out the extent and consider next steps.', 'Dormitory room – boarding school', 'V domově mládeže je Aleš svázaný spolužáky a ponižován livestreamem; vychovatelka musí zastavit šikanu, zjistit rozsah a zvážit další kroky.', 'Internátní pokoj - internátní škola');
INSERT INTO public.scenarios VALUES (10, '2025-04-26 14:54:46.248', 9, 'Anonymous photo montages mocking Sara and Maria spread on Instagram; one doesn''t go to school, the other cries, the teacher has to protect the victims and stop cyberbullying.
', 'Online (social media) & classroom', 'Na Instagramu se šíří anonymní fotomontáže zesměšňující Sáru a Marii; jedna nechodí do školy, druhá pláče, učitelka musí chránit oběti a zastavit kyberšikanu.', 'Online (sociální média) a ve třídě
');
INSERT INTO public.scenarios VALUES (6, '2025-04-26 14:54:46.248', 3, 'In the school cafeteria, Petra refuses food, looks faint and shares content on social media suggesting a possible eating disorder; the teacher is considering contacting her parents and a psychologist.', 'School cafeteria – lunch line', 'Ve školní jídelně Petra odmítá jídlo, vypadá na omdlení a na sociálních sítích sdílí obsah naznačující možnou poruchu příjmu potravy; učitelka zvažuje kontaktovat rodiče a psychologa.', 'Školní jídelna - fronta na obědy
');
INSERT INTO public.scenarios VALUES (7, '2025-04-26 14:54:46.248', 6, 'The gym teacher sees fresh cuts on Katka''s arm, the girl claims she was scratched by a cat and looks numb; the teacher decides how to open the topic of self-harm.', 'Gym changing room before PE lesson', 'Učitelka tělocviku zahlédne čerstvé řezné rány na Katčině ruce, dívka tvrdí, že ji poškrábal kocour a působí otupěle; učitelka řeší, jak otevřít téma sebepoškozování.', 'Šatna v tělocvičně před hodinou tělocviku
');
INSERT INTO public.scenarios VALUES (3, '2025-04-26 14:54:46.248', 2, 'During a maths lesson, Emil shouts out difficult questions and disturbs his classmates; the teacher has to quickly assign a more challenging task and keep the class''s attention.', 'Classroom – math lesson', 'Během hodiny matematiky Emil s hotovými úlohami vykřikuje složité dotazy a vyrušuje spolužáky; učitel musí rychle zadat náročnější úkol a udržet pozornost třídy.', 'Třída - hodina matematiky');
INSERT INTO public.scenarios VALUES (8, '2025-04-26 14:54:46.248', 7, 'During recess Robert throws a tennis ball, hits a classmate and rejects the authority of the assistant; the class becomes afraid of his aggressive outbursts and the parents do not cooperate.
', 'Primary classroom during break', 'Během přestávky Robert hází tenisákem, zasahuje spolužačku a odmítá autoritu asistentky; třída se začíná bát jeho agresivních výpadů a rodiče nespolupracují.', 'Třída základní školy o přestávce');
INSERT INTO public.scenarios VALUES (5, '2025-04-26 14:54:46.248', 5, 'During break, Marta spontaneously hugs a classmate, who reacts by refusing and shouting; the teacher has to explain the boundaries of personal space and calm the situation.', 'School corridor during break', 'O přestávce Marta spontánně obejme spolužačku, která reaguje odmítavě a křikem; učitel musí vysvětlit hranice osobního prostoru a zklidnit situaci.', 'Školní chodba během přestávky');


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: app_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_config_id_seq', COALESCE((SELECT MAX(id) FROM public.app_config), 1));


--
-- Name: conversation_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversation_roles_id_seq', COALESCE((SELECT MAX(id) FROM public.conversation_roles), 1));


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversations_id_seq', COALESCE((SELECT MAX(id) FROM public.conversations), 1));


--
-- Name: personalities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personalities_id_seq', COALESCE((SELECT MAX(id) FROM public.personalities), 1));


--
-- Name: realtime_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.realtime_models_id_seq', COALESCE((SELECT MAX(id) FROM public.realtime_models), 1));


--
-- Name: realtime_transcription_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.realtime_transcription_models_id_seq', COALESCE((SELECT MAX(id) FROM public.realtime_transcription_models), 1));


--
-- Name: response_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.response_models_id_seq', COALESCE((SELECT MAX(id) FROM public.response_models), 1));


--
-- Name: scenarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scenarios_id_seq', COALESCE((SELECT MAX(id) FROM public.scenarios), 1));


--
-- Name: timestamped_transcription_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.timestamped_transcription_models_id_seq', COALESCE((SELECT MAX(id) FROM public.timestamped_transcription_models), 1));


--
-- Name: tts_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tts_models_id_seq', COALESCE((SELECT MAX(id) FROM public.tts_models), 1));


--
-- PostgreSQL database dump complete
--
