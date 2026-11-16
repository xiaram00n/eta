(function () {
  "use strict";

  const phrases = [
    ["St. Thomas / U.S. Virgin Islands", "سانت توماس / جزر العذراء الأمريكية"],
    ["St. Thomas, U.S. Virgin Islands", "سانت توماس، جزر العذراء الأمريكية"],
    ["St. Thomas", "سانت توماس"],
    ["Interactive service preview", "معاينة تفاعلية للخدمة"],
    ["A better way around the island", "طريقة أسهل للتنقّل في الجزيرة"],
    ["Where are", "إلى أين"],
    ["headed?", "الذهاب؟"],
    ["Request a ride from a participating St. Thomas operator. They decide whether to accept and provide it; ETA would coordinate the confirmed pickup, driver, vehicle and updates on their behalf.", "اطلب رحلة من أحد مشغّلي النقل المشاركين في سانت توماس. يقرر المشغّل قبول الطلب وتنفيذ الرحلة؛ وتتولى ETA تنسيق نقطة الالتقاء والسائق والمركبة والتحديثات بعد تأكيدها نيابةً عنه."],
    ["Rides", "الرحلات"],
    ["Tours", "الجولات"],
    ["Stay rides", "تنقّلات الإقامة"],
    ["Weddings", "الأعراس"],
    ["My plans", "خططي"],
    ["A better way around the island", "طريقة أسهل للتنقّل في الجزيرة"],
    ["Ride type", "نوع الرحلة"],
    ["Local ride", "رحلة محلية"],
    ["Airport & ferry transfer", "تنقّل من المطار أو الميناء"],
    ["Airport & ferry", "المطار والميناء"],
    ["Your ride, your schedule", "رحلتك، حسب وقتك"],
    ["Pickup", "مكان الالتقاء"],
    ["Destination", "الوجهة"],
    ["Where should we meet you?", "أين نلتقي بك؟"],
    ["Where are you going?", "إلى أين تودّ الذهاب؟"],
    ["When", "الموعد"],
    ["Next available", "أقرب موعد متاح"],
    ["Choose a time", "اختر وقتاً"],
    ["Guests", "الركّاب"],
    ["Find a ride", "ابحث عن رحلة"],
    ["Prefer to plan ahead? Add a return or more stops in the next step.", "تفضّل التخطيط مسبقاً؟ أضف رحلة عودة أو محطات أخرى في الخطوة التالية."],
    ["Just looking? Take a sample ride", "تتصفّح فقط؟ جرّب رحلة تجريبية"],
    ["An illustrated journey across St. Thomas", "رسم توضيحي لرحلة عبر سانت توماس"],
    ["A stylized island, coastal roads, Charlotte Amalie and Red Hook. Decorative illustration, not a navigation map.", "رسم مبسّط للجزيرة وطرقها الساحلية وشارلوت أمالي ورد هوك. هذا رسم توضيحي وليس خريطة للملاحة."],
    ["AIRPORT", "المطار"],
    ["CHARLOTTE AMALIE", "شارلوت أمالي"],
    ["RED HOOK", "رد هوك"],
    ["CARIBBEAN SEA", "البحر الكاريبي"],
    ["Touch down. Settle in.", "وصلت؟ خذ وقتك واستقر."],
    ["Your first stop can already be in the plan.", "يمكن أن تكون محطتك الأولى ضمن الخطة."],
    ["Plan an airport transfer", "رتّب تنقّلك من المطار"],
    ["An island illustration, not live navigation.", "رسم توضيحي للجزيرة، وليس ملاحة مباشرة."],
    ["Transportation options", "خيارات التنقّل"],
    ["AIRPORT & FERRY", "المطار والميناء"],
    ["EVERYDAY RIDES", "رحلات يومية"],
    ["PRIVATE TOURS", "جولات خاصة"],
    ["RIDES DURING YOUR STAY", "تنقّلات خلال الإقامة"],
    ["More than the ride there", "أكثر من مجرد رحلة إلى وجهتك"],
    ["What brings you", "ما الذي جاء بك"],
    ["to the island?", "إلى الجزيرة؟"],
    ["Keep it simple for a single trip.", "رتّب رحلة واحدة ببساطة."],
    ["Bring it together for something bigger.", "واجمع التفاصيل إذا كانت خطتك أكبر."],
    ["TAKE THE SCENIC ROUTE", "اسلك الطريق الأجمل"],
    ["ARRIVE. UNPACK. GO ENJOY IT.", "صِل. استقرّ. وانطلق للاستمتاع."],
    ["EVERYONE IN THE RIGHT PLACE", "ليصل الجميع إلى المكان المناسب"],
    ["Private tours", "جولات خاصة"],
    ["A day that's yours.", "يوم على مزاجك."],
    ["Choose a route, bring your people, and leave time for the stops you came for.", "اختر مسارك، واصطحب من تحب، واترك وقتاً للمحطات التي جئت من أجلها."],
    ["Plan a private tour", "رتّب جولة خاصة"],
    ["Transportation during guest stays", "تنقّل الضيوف خلال إقامتهم"],
    ["Every ride, in one plan.", "كل التنقّلات ضمن خطة واحدة."],
    ["Plan separate arrivals, dinner rides and beach-day transportation for the people staying together.", "رتّب وصولات منفصلة ورحلات العشاء والتنقّل إلى الشاطئ للمجموعة المقيمة معاً."],
    ["Plan rides during your stay", "رتّب تنقّلات الإقامة"],
    ["Weddings & events", "الأعراس والفعاليات"],
    ["Your people. All together.", "أحبابك، في مكان واحد."],
    ["Guest pickups, wedding-party arrivals and the ride home. See how each group gets there.", "أماكن التقاء الضيوف ووصول مجموعة العرس ورحلة العودة. اعرف كيف تصل كل مجموعة."],
    ["Bring the plan together", "اجمع تفاصيل الخطة"],
    ["The details, taken care of", "كل التفاصيل في مكانها"],
    ["Less checking in.", "متابعة أقل."],
    ["More being here.", "ووقت أكثر للاستمتاع."],
    ["Know what's confirmed, who's meeting you, and what happens next. If your plans change, keep the conversation with the trip.", "اعرف ما تأكد، ومن سيلتقي بك، وما الخطوة التالية. وإذا تغيّرت خطتك، تبقى المحادثة مرتبطة بالرحلة."],
    ["Clear pickups, vehicles and guest counts", "تفاصيل واضحة لمكان الالتقاء والمركبات وعدد الركّاب"],
    ["A familiar driver, when available", "سائق تعرفه، متى ما كان متاحاً"],
    ["Changes, messages and payments in one place", "التعديلات والرسائل والمدفوعات في مكان واحد"],
    ["Plan sample rides for a stay", "رتّب تنقّلات تجريبية خلال الإقامة"],
    ["Your island week", "أسبوعك في الجزيرة"],
    ["Sample itinerary", "خطة تجريبية"],
    ["ARRIVE", "الوصول"],
    ["Airport to your villa", "من المطار إلى مكان الإقامة"],
    ["4 guests · Arrival pickup", "4 ركّاب · الالتقاء عند الوصول"],
    ["All in one plan", "كلها ضمن خطة واحدة"],
    ["GO OUT", "خروج"],
    ["Dinner in Red Hook", "عشاء في رد هوك"],
    ["6 guests · Return included", "6 ركّاب · رحلة العودة مشمولة"],
    ["EXPLORE", "استكشاف"],
    ["A beach day, your way", "يوم على الشاطئ كما تحب"],
    ["6 guests · Preferred driver requested", "6 ركّاب · طُلب سائق مفضّل"],
    ["Each trip has its own confirmation and updates.", "لكل رحلة تأكيدها وتحديثاتها الخاصة."],
    ["Start with the first ride", "ابدأ بالرحلة الأولى"],
    ["Landing soon?", "هل ستصل قريباً؟"],
    ["Add your arrival, your luggage and where you're staying.", "أضف تفاصيل وصولك وأمتعتك ومكان إقامتك."],
    ["See what a clear pickup arrangement could look like.", "شاهد كيف يمكن أن يبدو ترتيب واضح للالتقاء."],
    ["Plan an airport pickup", "رتّب الالتقاء عند المطار"],
    ["Service concept. All providers, availability, prices and trip updates in this preview are illustrative. No bookings, messages or payments are sent. Sample plans last only while this page is open.", "تصوّر للخدمة. جميع المشغّلين والتوفّر والأسعار وتحديثات الرحلات هنا أمثلة توضيحية. لا تُرسل حجوزات أو رسائل أو مدفوعات. تبقى الخطط التجريبية ما دامت هذه الصفحة مفتوحة."],
    ["About this preview", "عن هذه المعاينة"],
    ["The service preview needs JavaScript for sample bookings. No booking or payment can be made from this page.", "تحتاج معاينة الخدمة إلى JavaScript لعرض الحجوزات التجريبية. لا يمكن إجراء حجز أو دفع من هذه الصفحة."],
    ["Close preview and return to ETA", "أغلق المعاينة وعد إلى ETA"],
    ["Sample journey · nothing is sent", "رحلة تجريبية · لا يتم إرسال أي شيء"],
    ["Close journey preview", "أغلق معاينة الرحلة"],
    ["Your transportation", "تنقّلك"],
    ["A proposed booking and trip-coordination service", "تصوّر مقترح لخدمة حجز الرحلات وتنسيقها"],
    ["Your tourism website idea, made concrete", "فكرة موقعك السياحي، بصورة أوضح"],
    ["Make each ride easy,", "لنجعل كل رحلة سهلة،"],
    ["from request to ", "من الطلب وحتى "],
    ["pickup.", "الالتقاء."],
    ["ETA is a proposed booking and trip-coordination service for St. Thomas transportation businesses. Guests would request rides; participating operators would decide whether to accept and provide the ride. ETA would then coordinate the confirmed driver, vehicle and pickup, manage changes, and provide updates to the guest on the operator's behalf.", "ETA تصوّر مقترح لخدمة حجز الرحلات وتنسيقها لصالح أعمال النقل في سانت توماس. يطلب الضيوف الرحلات، ويقرر المشغّلون المشاركون قبول الطلب وتنفيذه. بعد التأكيد، تنسّق ETA السائق والمركبة ومكان الالتقاء، وتتابع التعديلات وترسل التحديثات إلى الضيف نيابةً عن المشغّل."],
    ["The aim is more efficient, convenient and faster travel for guests, while helping operators receive consistent guest requests, without the hassle of coordinating each booking.", "الهدف هو تنقّل أكثر كفاءة وراحة وسرعة للضيوف، مع مساعدة المشغّلين على تلقي طلبات منتظمة من دون عناء تنسيق كل حجز."],
    ["The guest prototype shows the traveler’s side. The operator tools are still a proposal. This walkthrough shows the work they may need to support and the questions we must answer before building them.", "يعرض النموذج الأولي تجربة المسافر. أما أدوات المشغّلين فما زالت مقترحاً. توضح هذه الجولة العمل الذي قد تدعمه تلك الأدوات والأسئلة التي ينبغي أن نجيب عنها قبل بنائها."],
    ["See how a request works", "شاهد كيف يسير الطلب"],
    ["An interactive guest example. No live operator system or bookings.", "مثال تفاعلي لتجربة الضيوف. لا يوجد نظام تشغيلي للمشغّلين أو حجوزات فعلية."],
    ["THE SERVICE AT A GLANCE", "لمحة عن الخدمة"],
    ["Three roles. One clear arrangement.", "ثلاثة أدوار. وترتيب واضح."],
    ["A request becomes a ride only when the work is committed.", "لا يصبح الطلب رحلة مؤكدة إلا عندما يلتزم أحد بتنفيذها."],
    ["Guest", "الضيف"],
    ["Requests a ride and shares pickup, destination, time and group details.", "يطلب رحلة ويشارك تفاصيل مكان الالتقاء والوجهة والوقت والمجموعة."],
    ["Operator", "المشغّل"],
    ["Checks the job, agreed price and suitable capacity, then accepts or declines.", "يراجع الطلب والسعر المتفق عليه والسعة المناسبة، ثم يقبل أو يعتذر."],
    ["Driver", "السائق"],
    ["Performs the trip after a suitable driver and vehicle are committed.", "ينفّذ الرحلة بعد الالتزام بتوفير سائق ومركبة مناسبين."],
    ["Intended business customer:", "العميل التجاري المقصود:"],
    ["a transportation operator or business. Who buys it and who handles coordination are still open questions.", "مشغّل نقل أو شركة نقل. ما زال تحديد الجهة التي ستشتري الخدمة وتتولى التنسيق سؤالاً مفتوحاً."],
    ["The guest preview is interactive. The operator-side system has not been built.", "معاينة الضيوف تفاعلية. لم يُبنَ نظام خاص بالمشغّلين بعد."],
    ["Walkthrough sections", "أقسام الجولة"],
    ["01 / The request", "01 / الطلب"],
    ["02 / Operator value", "02 / قيمة الخدمة للمشغّل"],
    ["03 / Guests", "03 / الضيوف"],
    ["04 / Why ETA?", "04 / لماذا ETA؟"],
    ["05 / Roles", "05 / الأدوار"],
    ["06 / Research & blockers", "06 / البحث والعوائق"],
    ["01 / What sits behind the screen", "01 / ما وراء الشاشة"],
    ["A website collects the request.", "الموقع يستقبل الطلب."],
    ["People make the ride possible.", "والناس هم من يجعلون الرحلة ممكنة."],
    ["ETA is not just a website. The proposed service connects guest requests with the operator’s decisions and the driver and vehicle committed to do the work.", "ETA ليست مجرد موقع. تربط الخدمة المقترحة طلبات الضيوف بقرارات المشغّل وبالسائق والمركبة الملتزمين بتنفيذ العمل."],
    ["Explore two possible outcomes", "استكشف نتيجتين محتملتين"],
    ["A suitable operator accepts", "يقبل مشغّل مناسب"],
    ["No suitable operator is available", "لا يتوفر مشغّل مناسب"],
    ["Illustrative ride / not a live request", "رحلة توضيحية / ليست طلباً فعلياً"],
    ["A clear request becomes a clear arrangement.", "الطلب الواضح يصبح ترتيباً واضحاً."],
    ["The guest asks", "الضيف يطلب"],
    ["Pickup, destination, time, guests and luggage. Enough information to know what the job needs.", "مكان الالتقاء والوجهة والوقت والركّاب والأمتعة. معلومات كافية لفهم متطلبات الرحلة."],
    ["A request, not a confirmed ride", "طلب، وليس رحلة مؤكدة"],
    ["An operator checks", "المشغّل يراجع"],
    ["A participating operator checks pickup eligibility, vehicle fit, availability and the applicable price before accepting the job.", "يتحقق المشغّل المشارك من إمكانية الالتقاء وملاءمة المركبة والتوفّر والسعر المعمول به قبل قبول الطلب."],
    ["A person commits to the work", "شخص يلتزم بتنفيذ العمل"],
    ["The guest knows the plan", "الضيف يعرف تفاصيل الخطة"],
    ["Who is meeting them, where, when, the agreed price, and how to ask for help if something changes.", "من سيلتقي به وأين ومتى، والسعر المتفق عليه، وكيف يطلب المساعدة إذا طرأ تغيير."],
    ["A confirmed arrangement", "ترتيب مؤكّد"],
    ["The ride happens", "تتم الرحلة"],
    ["Pickup updates, the trip, payment and any follow-up need to match what was agreed.", "ينبغي أن تتوافق تحديثات الالتقاء والرحلة والدفع وأي متابعة مع ما تم الاتفاق عليه."],
    ["A service delivered", "خدمة نُفّذت"],
    ["The screen helps both sides keep track. The operator's commitment is what makes the ride possible.", "تساعد الشاشة الطرفين على متابعة التفاصيل. لكن التزام المشغّل هو ما يجعل الرحلة ممكنة."],
    ["Illustrative exception / not a live request", "حالة استثنائية توضيحية / ليست طلباً فعلياً"],
    ["A payment button cannot supply a missing driver.", "زر الدفع لا يوفر سائقاً غير متاح."],
    ["The same clear request arrives. The website can collect it, but that is only the first step.", "يصل الطلب الواضح نفسه. يستطيع الموقع استقباله، لكن هذه ليست إلا الخطوة الأولى."],
    ["Request received", "تم استلام الطلب"],
    ["Nobody can accept", "لا يمكن لأحد قبول الطلب"],
    ["No participating operator can meet the time or vehicle needs. Interest in the job is not the same as availability.", "لا يستطيع أي مشغّل مشارك تلبية الوقت أو متطلبات المركبة. والرغبة في العمل لا تعني التوفّر."],
    ["Not confirmed", "غير مؤكّد"],
    ["Give an honest answer", "قدّم إجابة صريحة"],
    ["Ask whether another time would work, or explain that the request cannot be fulfilled. Do not promise a ride or take payment as though it is secured.", "اسأل إن كان وقت آخر مناسباً، أو وضّح أن الطلب لا يمكن تنفيذه. لا تعد برحلة ولا تقبل الدفع كما لو أنها مضمونة."],
    ["Alternative or clear decline", "بديل أو اعتذار واضح"],
    ["Learn from the gap", "تعلّم من سبب التعذّر"],
    ["Was the issue timing, vehicle capacity, coverage, or the way the request reached operators? That helps us choose what to improve.", "هل كانت المشكلة في التوقيت أو سعة المركبة أو نطاق الخدمة أو طريقة وصول الطلب للمشغّلين؟ يساعدنا ذلك على تحديد ما ينبغي تحسينه."],
    ["A question to investigate", "سؤال يحتاج إلى بحث"],
    ["This is why operators need to participate before we can promise the service to guests.", "لهذا يجب أن يشارك المشغّلون قبل أن نعد الضيوف بالخدمة."],
    ["Proposed operator-side tools · not built", "أدوات مقترحة للمشغّلين · لم تُبنَ بعد"],
    ["The operator can see what needs a decision.", "يرى المشغّل ما يحتاج إلى قرار."],
    ["A useful system would help the person responsible make a real commitment, not show availability that has not been checked.", "يساعد النظام المفيد المسؤول على اتخاذ التزام فعلي، بدلاً من عرض توفّر لم يتم التحقق منه."],
    ["Review the request", "راجع الطلب"],
    ["Pickup, destination, time, group, luggage and any service conditions.", "مكان الالتقاء والوجهة والوقت والمجموعة والأمتعة وأي شروط للخدمة."],
    ["Decide whether it fits", "قرّر إن كان مناسباً"],
    ["Check eligibility, price, driver, vehicle and actual availability. Accept or decline.", "تحقق من أهلية الخدمة والسعر والسائق والمركبة والتوفّر الفعلي. ثم اقبل أو اعتذر."],
    ["Record the commitment", "سجّل الالتزام"],
    ["Show who is responsible, what was agreed and what the guest should expect.", "وضّح من المسؤول وما الذي تم الاتفاق عليه وما الذي ينبغي أن يتوقعه الضيف."],
    ["Handle a change", "تعامل مع التغيير"],
    ["Keep the original arrangement clear until an authorized person agrees to a change.", "أبقِ الترتيب الأصلي واضحاً إلى أن يوافق شخص مخوّل على التعديل."],
    ["Why your involvement matters", "لماذا مشاركتك مهمة"],
    ["You know the work and the people doing it. You can help us understand what would make a driver choose to participate, what they could realistically keep updated, and what would make the arrangement useful enough to keep using.", "أنت تعرف طبيعة العمل والأشخاص الذين ينفذونه. ويمكنك مساعدتنا على فهم ما يشجّع السائق على المشاركة، وما الذي يستطيع تحديثه عملياً، وما الذي يجعل الترتيب مفيداً بما يكفي للاستمرار فيه."],
    ["02 / The intended business customer", "02 / العميل التجاري المقصود"],
    ["Keep control of your work.", "حافظ على سيطرتك على عملك."],
    ["Give useful requests a clearer path.", "ووفّر للطلبات المناسبة مساراً أوضح."],
    ["ETA is being explored for transportation operators and businesses. It should earn a place in their working day by addressing a real task or cost, not by adding another inbox.", "يجري استكشاف ETA لمشغّلي النقل وأعماله. وينبغي أن تستحق مكاناً في يوم العمل عبر معالجة مهمة أو كلفة حقيقية، لا بإضافة صندوق وارد آخر."],
    ["The direction we want to protect", "المبادئ التي نريد الحفاظ عليها"],
    ["Your business remains yours.", "عملك يبقى ملكك."],
    ["Your business name and existing customer relationships.", "اسم عملك وعلاقاتك الحالية مع العملاء."],
    ["A say in which work you accept and the price you agree.", "حقك في اختيار العمل الذي تقبله والسعر الذي توافق عليه."],
    ["Useful relationships with other drivers, associations and referral partners.", "العلاقات المفيدة مع السائقين الآخرين والجمعيات وجهات الإحالة."],
    ["The option to build around methods that already work, rather than replace them all at once.", "إمكانية البناء على الأساليب الناجحة بدلاً من استبدالها كلها دفعة واحدة."],
    ["Improvements worth investigating", "تحسينات تستحق البحث"],
    ["Less uncertainty. Better opportunities.", "غموض أقل. وفرص أفضل."],
    ["Requests with the details needed to judge the job.", "طلبات تتضمن التفاصيل اللازمة لتقييم العمل."],
    ["Fewer calls just to establish who is available or where a pickup stands.", "مكالمات أقل لمجرد معرفة من المتاح أو أين وصل ترتيب الالتقاء."],
    ["A clearer way to arrange return rides, groups and work shared with other operators.", "طريقة أوضح لترتيب رحلات العودة والمجموعات والعمل المشترك مع مشغّلين آخرين."],
    ["A useful presence in front of guests who are looking for the service you actually provide.", "حضور مفيد أمام الضيوف الباحثين عن الخدمة التي تقدمها فعلاً."],
    ["These are goals to test, not results we can promise. The questionnaire asks which problems happen in your business and what—if anything—a system should change.", "هذه أهداف نحتاج إلى اختبارها، وليست نتائج نعد بها. يسأل الاستبيان عن المشكلات التي تواجه عملك وما الذي ينبغي للنظام تغييره، إن وُجد."],
    ["Participation has to mean something practical", "ينبغي أن تكون للمشاركة فائدة عملية"],
    ["Opt in to receive requests—and keep each commitment accurate.", "اختر استقبال الطلبات، وحافظ على دقة كل التزام."],
    ["For ETA bookings to work, an operator would choose to participate and keep the system current. Opting in would not mean accepting every ride; it would mean taking responsibility for the work you choose to make available.", "لكي تعمل حجوزات ETA، يختار المشغّل المشاركة ويحافظ على تحديث النظام. ولا يعني الاشتراك قبول كل رحلة، بل تحمّل مسؤولية العمل الذي تختار إتاحته."],
    ["Choose which work you take", "اختر نوع العمل الذي تقبله"],
    ["Set the services, areas, schedules and vehicle capacity you are willing to offer. Requests outside those choices should not be sent to you; you decide whether each request fits.", "حدّد الخدمات والمناطق والمواعيد وسعة المركبات التي ترغب في تقديمها. لا ينبغي إرسال طلبات خارج هذه الخيارات إليك؛ وأنت تقرر مدى ملاءمة كل طلب."],
    ["Keep availability honest", "حدّث التوفّر بدقة"],
    ["An active or reserved ride, on-call commitment, booked tour or paid day rate means you are committed unless you confirm spare capacity. Mark the work complete and confirm the driver and vehicle are free before showing them as available again. A map location alone is not availability.", "تعني الرحلة الجارية أو المحجوزة، أو الالتزام بالاستعداد للنداء، أو الجولة المحجوزة، أو أجر اليوم المدفوع أنك ملتزم، ما لم تؤكد وجود سعة إضافية. سجّل اكتمال العمل وتأكد من تفرّغ السائق والمركبة قبل عرضهما متاحين من جديد. الموقع على الخريطة وحده لا يثبت التوفّر."],
    ["Accept or decline each request", "اقبل كل طلب أو اعتذر عنه"],
    ["A request can remain available to other opted-in operators until one accepts. Once accepted, it must close to others and show the guest which operator is responsible. Confirmation and any payment must match that operator—not a different driver who simply arrives.", "يمكن أن يبقى الطلب متاحاً للمشغّلين المشاركين الآخرين حتى يقبله أحدهم. وبعد القبول، يُغلق أمام الآخرين ويُبلّغ الضيف باسم المشغّل المسؤول. يجب أن يتطابق التأكيد وأي دفعة مع ذلك المشغّل، لا مع سائق آخر يصل فحسب."],
    ["Update changes with little effort", "حدّث التغييرات بسهولة"],
    ["Delays, pickup changes, cancellations and requests for help need a simple, reliable way to reach the responsible operator. The simplest safe workflow still needs to be tested during a real working day.", "تحتاج التأخيرات وتغييرات الالتقاء والإلغاءات وطلبات المساعدة إلى طريقة بسيطة وموثوقة للوصول إلى المشغّل المسؤول. وحتى أبسط سير عمل آمن يحتاج إلى اختبار خلال يوم عمل فعلي."],
    ["Illustrative message flow · proposed, not built", "مسار رسائل توضيحي · مقترح ولم يُبنَ"],
    ["Make common updates one tap—not a conversation a driver has to manage.", "اجعل التحديثات المعتادة بلمسة واحدة، لا محادثة يضطر السائق لإدارتها."],
    ["Operator → guest", "المشغّل ← الضيف"],
    ["“Running behind — traffic delay.”", "«سأتأخر بسبب ازدحام الطريق.»"],
    ["Send the notice right away; share a revised pickup time only when it is confirmed.", "أرسل التنبيه فوراً، ولا تشارك وقتاً جديداً للالتقاء إلا بعد تأكيده."],
    ["Guest → operator", "الضيف ← المشغّل"],
    ["“I can wait.” “I need a change.” “Please cancel.”", "«أستطيع الانتظار.» «أحتاج إلى تعديل.» «يرجى الإلغاء.»"],
    ["A separate option could say:", "وقد يظهر خيار منفصل يقول:"],
    ["Chat with [Operator Name]", "تواصل مع [اسم المشغّل]"],
    ["A change or cancellation must reach the responsible operator or coordinator—not only a driver who may be moving. Show the guest whether a message was sent, delivered or acknowledged; delivery does not mean the operator has read or accepted it. Drivers must never be expected to read or reply in motion. Confirm notification channels and current local requirements before a live pilot.", "يجب أن يصل التعديل أو الإلغاء إلى المشغّل أو المنسّق المسؤول، لا إلى سائق قد يكون في الطريق وحده. وضّح للضيف إن كانت الرسالة قد أُرسلت أو وصلت أو تم الإقرار بها؛ فوصولها لا يعني أن المشغّل قرأها أو وافق عليها. ويجب ألا يُتوقع من السائق القراءة أو الرد أثناء القيادة. تحقّق من قنوات الإشعار والمتطلبات المحلية الحالية قبل أي تجربة تشغيلية."],
    ["Existing customers and referral relationships matter. We need to understand when operators want to share work, who can commit a driver and vehicle, and what should stay under their own control.", "العملاء الحاليون وعلاقات الإحالة مهمون. نحتاج إلى فهم متى يرغب المشغّلون في مشاركة العمل، ومن يملك صلاحية الالتزام بسائق ومركبة، وما الذي ينبغي أن يبقى تحت سيطرتهم."],
    ["03 / A reason for guests to use it", "03 / سبب يدفع الضيوف لاستخدامها"],
    ["Being online is a start.", "الوجود على الإنترنت بداية."],
    ["Being useful is the reason to return.", "والفائدة هي سبب العودة."],
    ["We need both sides: operators who can deliver the service, and guests who have a reason to find and choose it.", "نحتاج إلى الطرفين: مشغّلين قادرين على تقديم الخدمة، وضيوف لديهم سبب للعثور عليها واختيارها."],
    ["FIND / CHOOSE / RETURN", "اعثر / اختر / عُد"],
    ["Which guest?", "أي ضيف؟"],
    ["Which need?", "أي حاجة؟"],
    ["Why this service?", "لماذا هذه الخدمة؟"],
    ["One clearly defined problem is a better starting point than trying to offer everything to every visitor.", "البدء بمشكلة محددة بوضوح أفضل من محاولة تقديم كل شيء لكل زائر."],
    ["Find it", "اعثر عليها"],
    ["Give the right people a way to discover it.", "ساعد الأشخاص المناسبين على اكتشافها."],
    ["Search and business listings, accommodation referrals, existing contacts, or carefully tested advertising are possible routes. A Google Business Profile is one option to investigate where eligible, not a guarantee of inquiries.", "قد تشمل الوسائل البحث وقوائم الأنشطة التجارية وإحالات أماكن الإقامة والعلاقات الحالية أو إعلانات تُختبر بعناية. ويمكن دراسة الملف التجاري على Google عند استيفاء الشروط، لكنه لا يضمن وصول طلبات."],
    ["Choose it", "اخترها"],
    ["Make the benefit easy to understand.", "اجعل فائدتها واضحة."],
    ["A local ride, an arrival pickup, or a return already arranged. Start with a need operators can reliably meet, and explain what is clearer or easier than the alternatives.", "رحلة محلية، أو التقاء عند الوصول، أو عودة مرتبة مسبقاً. ابدأ بحاجة يستطيع المشغّلون تلبيتها بثقة، واشرح ما الذي يجعل الخدمة أوضح أو أسهل من البدائل."],
    ["Use it again", "استخدمها مجدداً"],
    ["Deliver what the guest was told to expect.", "قدّم ما وُعد به الضيف."],
    ["Accurate information and a dependable ride give the guest a reason to come back or recommend it. The website alone cannot create that experience.", "المعلومات الدقيقة والرحلة الموثوقة تمنحان الضيف سبباً للعودة أو التوصية بالخدمة. الموقع وحده لا يصنع هذه التجربة."],
    ["These are routes to test, not a completed marketing plan. Advertising costs, demand, competing services and the effort needed to win a booking still need checking.", "هذه وسائل تحتاج إلى اختبار، وليست خطة تسويق مكتملة. وما زالت تكاليف الإعلان والطلب والخدمات المنافسة والجهد اللازم للفوز بالحجز بحاجة إلى دراسة."],
    ["04 / Why ETA?", "04 / لماذا ETA؟"],
    ["A familiar name.", "اسم مألوف."],
    ["A useful double meaning.", "ومعنيان مفيدان."],
    ["The same three letters connect the guest's journey with the work that makes it happen.", "تربط الأحرف الثلاثة نفسها رحلة الضيف بالعمل الذي يجعلها ممكنة."],
    ["For operators", "للمشغّلين"],
    ["Enhanced Transportation Administrators", "منظّمو خدمات النقل المحسّنة"],
    ["A name for the purpose behind the product: supporting the people who organize transportation. Clearer requests, easier coordination, and less duplicated administration around the work they already do.", "اسم يعبّر عن غاية المنتج: دعم الأشخاص الذين ينظّمون النقل. طلبات أوضح، وتنسيق أسهل، وأعمال إدارية مكررة أقل حول عملهم الحالي."],
    ["For guests", "للضيوف"],
    ["Estimated Time of Arrival", "الوقت المقدّر للوصول"],
    ["Familiar transportation language, connected to a practical question: when will my ride arrive? It gives the name a recognizable link to pickups, departures, and getting where you need to be.", "عبارة مألوفة في مجال النقل ترتبط بسؤال عملي: متى ستصل رحلتي؟ وتربط الاسم بمواعيد الالتقاء والانطلاق والوصول إلى وجهتك."],
    ["ETA is our working name for this prototype. The idea is to make the connection easy to understand; final branding still needs its own review.", "ETA هو الاسم المؤقت لهذا النموذج. الفكرة أن يكون الرابط بين المعنيين واضحاً؛ أما الهوية النهائية فما زالت بحاجة إلى مراجعة مستقلة."],
    ["05 / Who uses it—and who decides", "05 / من يستخدمها ومن يقرر"],
    ["Different roles.", "أدوار مختلفة."],
    ["Different decisions.", "وقرارات مختلفة."],
    ["Guests use the booking experience. Transportation businesses are the intended customers for any operator tools. Drivers do the work. The exact buyer and operating responsibilities still need to be established.", "يستخدم الضيوف تجربة الحجز. وأعمال النقل هي العملاء المقصودون لأي أدوات للمشغّلين. أما السائقون فينفّذون العمل. وما زال تحديد المشتري والمسؤوليات التشغيلية بحاجة إلى بحث."],
    ["Guest · booking user", "الضيف · مستخدم الحجز"],
    ["Describe the ride.", "صف الرحلة."],
    ["Review the arrangement.", "وراجع الترتيب."],
    ["Share where and when you need transportation, who is traveling, and any relevant trip details. A request is not a confirmed ride until an operator accepts and the work is committed.", "شارك أين ومتى تحتاج إلى التنقّل، ومن سيرافقك، وأي تفاصيل مهمة للرحلة. لا يصبح الطلب رحلة مؤكدة حتى يقبله مشغّل ويلتزم بتنفيذه."],
    ["Operator or business · intended customer", "المشغّل أو الشركة · العميل المقصود"],
    ["Choose the work.", "اختر العمل."],
    ["Commit the service.", "والتزم بتقديم الخدمة."],
    ["Decide which requests fit, what price applies, and who will provide the suitable vehicle. Keep control of existing guests and choose when—if ever—to share work.", "قرّر أي الطلبات مناسب والسعر المعمول به ومن سيوفر المركبة المناسبة. احتفظ بالسيطرة على عملائك الحاليين واختر متى تشارك العمل، إن رغبت."],
    ["Driver · service provider", "السائق · مقدّم الخدمة"],
    ["Take the trip", "نفّذ الرحلة"],
    ["you have agreed to do.", "التي وافقت عليها."],
    ["A driver needs to know the pickup, schedule and vehicle arrangement—and to be actually available and committed. A map location alone does not confirm that a driver is available or committed to the trip.", "يحتاج السائق إلى معرفة مكان الالتقاء والموعد وترتيب المركبة، وأن يكون متاحاً وملتزماً فعلاً. موقعه على الخريطة وحده لا يؤكد توفّره أو التزامه بالرحلة."],
    ["What we are asking from you now", "ما نطلبه منك الآن"],
    ["Help us understand the work.", "ساعدنا على فهم العمل."],
    ["You know the local working reality and may challenge or explain the idea. If you choose, you can introduce willing operators for feedback. You are not being asked to sell a service, guarantee bookings, or promise anyone will participate.", "أنت تعرف واقع العمل المحلي ويمكنك مناقشة الفكرة أو توضيحها. وإذا رغبت، يمكنك تعريفنا بمشغّلين مستعدين لإبداء رأيهم. لا نطلب منك بيع خدمة أو ضمان حجوزات أو التعهد بمشاركة أي شخص."],
    ["I will use the research to refine the prototype, explain what remains unknown and bring concrete choices back for discussion. No operating or commercial arrangement is being assumed.", "سأستخدم البحث لتحسين النموذج، وشرح ما لا يزال مجهولاً، وطرح خيارات واضحة للنقاش. ولا نفترض وجود أي ترتيب تشغيلي أو تجاري."],
    ["A simple way to explain the idea to another operator", "طريقة بسيطة لشرح الفكرة لمشغّل آخر"],
    ["We're exploring a way to make arranging rides clearer for guests and the operators doing the work. The example shows what might be possible; it is not a service already taking bookings. We'd like to understand how your business works, what you already use, and what would genuinely make the work easier. Your experience will help us judge what is useful and what we should change.", "نستكشف طريقة تجعل ترتيب الرحلات أوضح للضيوف والمشغّلين الذين ينفذون العمل. يوضح المثال ما قد يكون ممكناً، لكنه ليس خدمة تستقبل حجوزات حالياً. نود فهم طريقة عمل شركتك، والأدوات التي تستخدمها، وما الذي يجعل العمل أسهل فعلاً. ستساعدنا خبرتك على معرفة ما يفيد وما ينبغي تغييره."],
    ["Use this as a starting point for the conversation, not a script that replaces listening.", "استخدم هذا كنقطة بداية للحوار، لا كنصّ يحل محل الإصغاء."],
    ["06 / What research must settle", "06 / ما الذي ينبغي أن يحسمه البحث"],
    ["Research tells us", "البحث يوضح لنا"],
    ["what is worth building.", "ما الذي يستحق البناء."],
    ["The questionnaire is part of product development. It asks about actual bookings, working methods, existing tools and costs so we can define a useful service rather than guess.", "الاستبيان جزء من تطوير المنتج. يسأل عن الحجوزات الفعلية وأساليب العمل والأدوات والتكاليف الحالية، كي نحدد خدمة مفيدة بدلاً من التخمين."],
    ["The operator questionnaire answers", "يجيب استبيان المشغّلين عن"],
    ["What is happening today?", "ما الذي يحدث اليوم؟"],
    ["Which bookings you complete, what you collect, what you spend, how guests reach you, what tools you already use, and who can commit a driver and vehicle.", "أنواع الحجوزات التي تنفذها، وما تحصل عليه وتنفقه، وكيف يصل إليك الضيوف، والأدوات التي تستخدمها، ومن يملك صلاحية الالتزام بسائق ومركبة."],
    ["These answers help identify a task or existing expense the system might improve. They do not prove that ETA caused revenue or savings. Estimates are welcome; private records are not needed.", "تساعد هذه الإجابات على تحديد مهمة أو كلفة حالية قد يحسّنها النظام. لكنها لا تثبت أن ETA تسببت في دخل أو توفير. نرحب بالتقديرات ولا نحتاج إلى سجلات خاصة."],
    ["Still to verify before a real pilot", "ما زال بحاجة إلى تحقق قبل أي تجربة فعلية"],
    ["Who can do what—and under which conditions?", "من يستطيع فعل ماذا، وتحت أي شروط؟"],
    ["Which operators and drivers choose to participate, who has authority to accept and assign work, what pickups and services they can provide, and who handles changes or failed arrangements.", "أي مشغّلين وسائقين يختارون المشاركة، ومن يملك صلاحية قبول العمل وتوزيعه، وما أماكن الالتقاء والخدمات التي يمكنهم توفيرها، ومن يتولى التغييرات أو الترتيبات التي لم تنجح."],
    ["Pickup access, service rules, applicable fares and any separate platform charges need confirmation with the appropriate parties. We also need to identify the first customer, the specific problem to solve and how this would improve on existing options.", "يجب التحقق مع الجهات المعنية من إمكانية الوصول إلى أماكن الالتقاء وقواعد الخدمة والتعرفة المعمول بها وأي رسوم منفصلة للمنصة. كما ينبغي تحديد العميل الأول والمشكلة المحددة وكيف ستحسّن الخدمة الخيارات الحالية."],
    ["Listen", "استمع"],
    ["Walk through a recent booking and hear from willing operators with different ways of working.", "راجع حجزاً حديثاً واستمع إلى مشغّلين مستعدين لديهم أساليب عمل مختلفة."],
    ["Choose", "اختر"],
    ["Pick one recurring problem, a specific guest need, and a small group able to try a different approach.", "حدّد مشكلة متكررة وحاجة واضحة للضيف ومجموعة صغيرة تستطيع تجربة أسلوب مختلف."],
    ["Prepare", "استعد"],
    ["Confirm pickup eligibility, driver commitments, applicable fares and who handles changes before trying a real trip.", "تحقق من أهلية الالتقاء والتزامات السائقين والتعرفة المعمول بها والمسؤول عن التغييرات قبل تجربة رحلة فعلية."],
    ["Test & review", "اختبر وراجع"],
    ["Compare completed work, failures, effort and return with the current approach. Identify what was replaced or improved, not just what the app added.", "قارن العمل المنجز والإخفاقات والجهد والعائد بالأسلوب الحالي. حدّد ما تم استبداله أو تحسينه، لا ما أضافه التطبيق فحسب."],
    ["Choose the next step", "اختر الخطوة التالية"],
    ["Help us decide", "ساعدنا على تحديد"],
    ["what deserves building.", "ما الذي يستحق البناء."],
    ["Share how a booking really works, what gets in the way and what should stay under your control. Every questionnaire answer is optional.", "شاركنا كيف يسير الحجز فعلياً، وما الذي يعرقله، وما الذي ينبغي أن يبقى تحت سيطرتك. كل إجابات الاستبيان اختيارية."],
    ["Share your operator experience", "شاركنا تجربتك كمشغّل"],
    ["The guest example shows how a traveler could make a request.", "يوضح مثال الضيوف كيف يمكن للمسافر إرسال طلب."],
    ["Explore the guest experience", "استكشف تجربة الضيوف"],
    ["answer the operator questionnaire", "أجب عن استبيان مشغّلي النقل"],
    ["A proposed St. Thomas booking and trip-coordination service.", "تصوّر مقترح لحجز الرحلات وتنسيقها في سانت توماس."],
    ["Interactive guest prototype. No live operator system or bookings.", "نموذج تفاعلي للضيوف. لا يوجد نظام تشغيلي للمشغّلين أو حجوزات فعلية."],
    ["Back to the beginning", "العودة إلى البداية"],
    ["Help decide what ETA should build", "ساعد في تحديد ما ينبغي أن تطوّره ETA"],
    ["Better-arranged rides", "رحلات مرتّبة بشكل أفضل"],
    ["start with your real work.", "تبدأ من واقع عملك."],
    ["Taxi operators asked, we listened.", "طلب مشغّلو سيارات الأجرة أن نُصغي، فاستمعنا."],
    ["ETA is a proposed booking and trip-coordination service for St. Thomas transportation businesses. Guests would request rides; participating operators would decide whether to accept and provide the ride. ETA would then coordinate the confirmed driver, vehicle and pickup, manage changes, and provide updates to the guest on the operator's behalf.", "ETA تصوّر مقترح لخدمة حجز الرحلات وتنسيقها لصالح أعمال النقل في سانت توماس. يطلب الضيوف الرحلات، ويقرر المشغّلون المشاركون قبول الطلب وتنفيذه. بعد التأكيد، تنسّق ETA السائق والمركبة ومكان الالتقاء، وتتابع التعديلات وترسل التحديثات إلى الضيف نيابةً عن المشغّل."],
    ["This could make travel more efficient, convenient and faster for guests, while helping operators receive consistent guest requests, without the hassle of coordinating each booking.", "قد يجعل هذا تنقّل الضيوف أكثر كفاءة وراحة وسرعة، ويساعد المشغّلين على تلقي طلبات منتظمة من دون عناء تنسيق كل حجز."],
    ["The guest prototype shows the traveler’s side. The operator tools are still a proposal. Your answers help us decide whether those tools solve a real problem, what they must do and what they must preserve.", "يعرض النموذج الأولي تجربة المسافر، وما زالت أدوات المشغّلين مقترحاً. تساعدنا إجاباتك على معرفة إن كانت تعالج مشكلة حقيقية، وما الذي يجب أن تفعله وتحافظ عليه."],
    ["Driving guests and showing them around the island is what", "قيادة الضيوف وتعريفهم بالجزيرة هو ما"],
    ["you", "تجيده"],
    ["do best. Understanding the work and designing systems that support it is what", "بأفضل صورة. أما فهم العمل وتصميم أنظمة تدعمه فهو ما"],
    ["we", "نجيده"],
    ["do best.", "بأفضل صورة."],
    ["Help decide what we build to support your business.", "ساعدنا في تحديد ما سنبنيه لدعم عملك."],
    ["A useful system earns its place by improving existing work—not adding another expense.", "يستحق النظام المفيد مكانه عندما يحسّن العمل القائم، لا عندما يضيف كلفة أخرى."],
    ["VI Transportation Operator Questionnaire", "استبيان مشغّلي النقل في جزر العذراء"],
    ["Eight short sections about bookings, tools you use, work you complete, money you receive and spend, and time spent coordinating. Your answers guide what to build; they do not assume a solution.", "ثمانية أقسام قصيرة عن الحجوزات والأدوات التي تستخدمها والعمل الذي تنجزه والأموال التي تحصل عليها وتنفقها والوقت الذي تقضيه في التنسيق. توجه إجاباتك ما سنبنيه، ولا تفترض حلاً مسبقاً."],
    ["Every question is optional. Estimates and “not sure” are useful. No documents, customer lists, account details or other sensitive information are needed.", "كل الأسئلة اختيارية. التقديرات وإجابة «لست متأكداً» مفيدة. لا نحتاج إلى مستندات أو قوائم عملاء أو تفاصيل حسابات أو معلومات حساسة أخرى."],
    ["Answers stay in this browser on this device until you clear the draft or a submission is confirmed. On a shared device, clear the draft when you finish. You will review your answers before choosing to submit them to ETA.", "تبقى الإجابات في هذا المتصفح وعلى هذا الجهاز إلى أن تمسح المسودة أو يتأكد إرسالها. إذا كان الجهاز مشتركاً، فامسح المسودة عند الانتهاء. ستراجع إجاباتك قبل اختيار إرسالها إلى ETA."],
    ["BEGIN ➔", "ابدأ ➔"],
    ["Test response: marked as test data, not an ordinary research response.", "إجابة اختبار: ستُعلّم كبيانات اختبار، لا كإجابة بحثية عادية."],
    ["Operator questionnaire", "استبيان مشغّلي النقل"],
    ["Section progress", "التقدّم بين الأقسام"],
    ["Progress follows sections, not the number of questions answered.", "يعكس التقدّم الأقسام، لا عدد الأسئلة التي أُجيب عنها."],
    ["Clear draft", "امسح المسودة"],
    ["Back", "السابق"],
    ["Continue", "تابع"],
    ["Skip to content", "انتقل إلى المحتوى"],
    ["Skip to questionnaire", "انتقل إلى الاستبيان"],
    ["Research, not a promise of bookings or earnings.", "بحث، وليس وعداً بحجوزات أو دخل."],
    ["Do not send permits or documents; this is discovery, not legal clearance.", "لا ترسل تصاريح أو مستندات؛ هذا بحث استكشافي وليس موافقة قانونية."],
    ["Choose all that apply.", "اختر كل ما ينطبق."],
    ["Choose up to three.", "اختر حتى ثلاثة خيارات."],
    ["Not sure", "لست متأكداً"],
    ["Not tracked / not sure", "غير مسجّل / لست متأكداً"],
    ["Cannot separate this figure", "لا أستطيع فصل هذا الرقم"],
    ["Prefer not to say", "أفضل عدم الإجابة"],
    ["Leave unanswered", "اتركه بلا إجابة"],
    ["Leave this question unanswered", "اترك هذا السؤال بلا إجابة"],
    ["Enter an amount (an estimate is fine)", "أدخل مبلغاً (يمكن أن يكون تقديرياً)"],
    ["Enter a count (an estimate is fine)", "أدخل عدداً (يمكن أن يكون تقديرياً)"],
    ["Amount in US dollars", "المبلغ بالدولار الأمريكي"],
    ["Number of completed bookings", "عدد الحجوزات المنجزة"],
    ["Review my answers", "راجع إجاباتي"],
    ["Research complete", "اكتمل الاستبيان"],
    ["A little about you, only if you wish.", "معلومات بسيطة عنك، إذا رغبت فقط."],
    ["Your experience helps us understand what could make operators' work easier and more profitable. If you'd like us to know who these answers came from, you're welcome to leave your name and contact details below.", "تساعدنا خبرتك على فهم ما قد يجعل عمل المشغّلين أسهل وأكثر جدوى. إذا رغبت في إخبارنا بهويتك، يمكنك كتابة اسمك وبيانات التواصل أدناه."],
    ["You do not have to share either. Prefer not to? Thank you for taking the time to help.", "لست ملزماً بمشاركة أي منهما. وإن فضّلت عدم ذلك، فنشكرك على وقتك ومساعدتك."],
    ["Name (optional)", "الاسم (اختياري)"],
    ["Contact details (optional)", "بيانات التواصل (اختيارية)"],
    ["Prefer not to share contact details", "أفضل عدم مشاركة بيانات التواصل"],
    ["Email", "البريد الإلكتروني"],
    ["Phone / WhatsApp", "الهاتف / واتساب"],
    ["Email address (optional)", "البريد الإلكتروني (اختياري)"],
    ["Phone / WhatsApp number (optional)", "رقم الهاتف / واتساب (اختياري)"],
    ["Sharing your details does not automatically give us permission to contact you. Choose an invitation below only if you would like one; include a contact detail if you do.", "مشاركة بياناتك لا تمنحنا تلقائياً الإذن بالتواصل معك. اختر دعوة أدناه فقط إذا رغبت بها، وأضف وسيلة تواصل عندئذ."],
    ["May we contact you? (Optional)", "هل تسمح لنا بالتواصل معك؟ (اختياري)"],
    ["Clarifying my research answers", "لتوضيح إجاباتي البحثية"],
    ["Inviting me to give feedback on a prototype", "لدعوتي لإبداء رأيي في نموذج أولي"],
    ["Check the same submission.", "راجع الإرسال نفسه."],
    ["Your experience, in your words.", "خبرتك، بكلماتك."],
    ["Confirmation is still pending. Retry sends the same response with the same reference, not a second research response.", "لم يصل التأكيد بعد. إعادة المحاولة ترسل الإجابة نفسها بالمرجع نفسه، ولا تنشئ إجابة بحثية ثانية."],
    ["Review your answers before sending. You can go back, change anything, or leave questions unanswered.", "راجع إجاباتك قبل الإرسال. يمكنك الرجوع وتعديل أي شيء أو ترك الأسئلة بلا إجابة."],
    ["Not applicable based on your earlier answer.", "لا ينطبق بناءً على إجابتك السابقة."],
    ["Your optional details and permissions", "بياناتك وأذونات التواصل الاختيارية"],
    ["Prototype feedback invitation", "دعوة لإبداء الرأي في النموذج الأولي"],
    ["Clarifying research answers", "توضيح الإجابات البحثية"],
    ["No follow-up contact requested.", "لم تطلب أي تواصل لاحق."],
    ["Submitting sends these answers to ETA. No booking, payment or subscription is created.", "إرسال هذه الإجابات يرسلها إلى ETA. لن يُنشأ حجز أو دفعة أو اشتراك."],
    ["Back to edit", "العودة للتعديل"],
    ["Retry same submission", "أعد إرسال الإجابة نفسها"],
    ["Submit answers", "أرسل الإجابات"],
    ["Waiting for confirmation...", "بانتظار التأكيد..."],
    ["Thank you.", "شكراً لك."],
    ["Your answers are saved. Your experience will help us decide where a different approach could genuinely support operators.", "تم حفظ إجاباتك. ستساعدنا خبرتك على تحديد المجالات التي يمكن فيها لنهج مختلف أن يدعم المشغّلين فعلياً."],
    ["Your answers are still here.", "ما زالت إجاباتك محفوظة هنا."],
    ["All pickup dates and times are St. Thomas local time (AST).", "جميع تواريخ وأوقات الالتقاء حسب التوقيت المحلي لسانت توماس (AST)."],
    ["messages", "الرسائل"],
    ["payments", "المدفوعات"],
    ["itinerary", "خطة الرحلة"],
    ["Request prepared", "تم إعداد الطلب"],
    ["Sample capacity held", "تم حجز سعة تجريبية مؤقتاً"],
    ["Confirmed", "مؤكّد"],
    ["On the way", "في الطريق"],
    ["At your pickup", "وصل إلى مكان الالتقاء"],
    ["Your way", "في طريقك"],
    ["Completed", "مكتمل"],
    ["Needs attention", "يتطلب الانتباه"],
    ["Canceled", "ملغى"],
    ["Your local ride", "رحلتك المحلية"],
    ["Airport & ferry", "المطار والميناء"],
    ["Your arrival, arranged", "وصولك، مرتب"],
    ["Private tour", "جولة خاصة"],
    ["Your day on the island", "يومك في الجزيرة"],
    ["Transportation during your stay", "التنقّل خلال إقامتك"],
    ["Stay rides", "تنقّلات الإقامة"],
    ["Everyone, in the right place", "الجميع في المكان المناسب"],
    ["Wedding", "عرس"],
    ["A clear pickup", "التقاء واضح"],
    ["Add a return, note your luggage, and request a familiar driver. Availability still needs to be secured.", "أضف رحلة عودة، وسجّل أمتعتك، واطلب سائقاً تعرفه. يبقى التوفّر بحاجة إلى تأكيد."],
    ["Arrive with a plan", "صل مع خطة واضحة"],
    ["Add your flight or ferry details. An arrival delay should become a reviewed change, not a missed pickup.", "أضف تفاصيل رحلتك الجوية أو البحرية. ينبغي مراجعة تأخر الوصول كتعديل، لا أن يؤدي إلى فوات الالتقاء."],
    ["Room to explore", "متّسع للاستكشاف"],
    ["Rides during your stay", "تنقّلات خلال الإقامة"],
    ["Every group accounted for", "ترتيب يناسب كل مجموعة"],
    ["01 / Arrange your transportation", "01 / رتّب تنقّلك"],
    ["Choose a service", "اختر خدمة"],
    ["Example itinerary", "مسار تجريبي"],
    ["Scenic island + beach", "جولة في الجزيرة والشاطئ"],
    ["East End + beach stops", "الطرف الشرقي ومحطات الشاطئ"],
    ["Request your own route", "اطلب مسارك الخاص"],
    ["Reserved tour time", "مدة الجولة المحجوزة"],
    ["3 hours", "3 ساعات"],
    ["4 hours", "4 ساعات"],
    ["6 hours", "6 ساعات"],
    ["Trip", "رحلة"],
    ["Pickup group", "مجموعة الالتقاء"],
    ["Separate groups can have their own vehicles and times.", "يمكن تخصيص مركبات ومواعيد منفصلة للمجموعات."],
    ["Keep the pickup and return as separate trips.", "اجعل الالتقاء والعودة رحلتين منفصلتين."],
    ["Remove", "أزل"],
    ["Group name", "اسم المجموعة"],
    ["Trip name", "اسم الرحلة"],
    ["Tour stops", "محطات الجولة"],
    ["Date", "التاريخ"],
    ["Pickup time", "وقت الالتقاء"],
    ["+ Add pickup group / return", "+ أضف مجموعة التقاء / عودة"],
    ["+ Add a trip / return", "+ أضف رحلة / عودة"],
    ["Make the arrangement fit your group.", "رتّب الخطة بما يناسب مجموعتك."],
    ["Preferred driver for first pickup", "السائق المفضّل للالتقاء الأول"],
    ["No preference", "لا تفضيل"],
    ["(example driver)", "(سائق افتراضي)"],
    ["Requested for later trips too, where available. Each assignment is shown before you confirm.", "سيُطلب للرحلات اللاحقة أيضاً عند توفره. ستظهر تفاصيل كل رحلة قبل التأكيد."],
    ["Most large bags on any trip", "أكبر عدد من الحقائب في أي رحلة"],
    ["Flight / ferry arrival reference (optional)", "مرجع الوصول الجوي / البحري (اختياري)"],
    ["Use a sample reference", "استخدم مرجعاً تجريبياً"],
    ["Reserved driver time", "مدة حجز السائق"],
    ["Booked trips only", "الرحلات المحجوزة فقط"],
    ["2-hour reserved window", "فترة حجز ساعتين"],
    ["4-hour reserved window", "فترة حجز 4 ساعات"],
    ["8-hour reserved window", "فترة حجز 8 ساعات"],
    ["Reserved time is separate from requesting a preferred driver. It needs a specific vehicle, start time and agreed price.", "مدة الحجز منفصلة عن طلب سائق مفضّل، وتتطلب مركبة محددة ووقت بدء وسعراً متفقاً عليه."],
    ["Accessible vehicle / boarding assistance needed", "أحتاج إلى مركبة مهيأة / مساعدة للصعود"],
    ["Anything else to arrange? (optional)", "هل هناك تفاصيل أخرى؟ (اختياري)"],
    ["Use sample details for this preview.", "استخدم تفاصيل تجريبية في هذه المعاينة."],
    ["Review my plan", "راجع خطتي"],
    ["This creates a sample request, not a booking.", "هذا ينشئ طلباً تجريبياً، وليس حجزاً."],
    ["The important part", "ما المهم"],
    ["Pickup and destination", "مكان الالتقاء والوجهة"],
    ["Guests, luggage and vehicle fit", "الركّاب والأمتعة وملاءمة المركبة"],
    ["Availability before confirmation", "تأكيد التوفّر قبل التأكيد النهائي"],
    ["A clear price before payment", "سعر واضح قبل الدفع"],
    ["Your plans, together", "خططك، معاً"],
    ["Arrange a local ride or plan transportation for a guest stay. Your sample itinerary will appear here as you explore the preview.", "رتّب رحلة محلية أو تنقّلاً خلال الإقامة. ستظهر خطتك التجريبية هنا أثناء استكشاف المعاينة."],
    ["Your next ride starts here.", "رحلتك التالية تبدأ من هنا."],
    ["Sample plans you create while this page is open. No account or real reservation is created.", "خطط تجريبية تنشئها ما دامت هذه الصفحة مفتوحة. لا يُنشأ حساب أو حجز فعلي."],
    ["View plan", "اعرض الخطة"],
    ["Your arrangement", "ترتيبك"],
    ["Trips / pickup groups", "الرحلات / مجموعات الالتقاء"],
    ["Required vehicle assignments", "المركبات المطلوبة"],
    ["Preferred driver", "السائق المفضّل"],
    ["(request)", "(طلب)"],
    ["Luggage / boarding", "الأمتعة / الصعود"],
    ["large bags", "حقائب كبيرة"],
    ["accessible vehicle review", "مراجعة المركبة المهيأة"],
    ["Arrival reference", "مرجع الوصول"],
    ["Notes", "ملاحظات"],
    ["Sample transportation", "تنقّل تجريبي"],
    ["Sample reserved time", "مدة حجز تجريبية"],
    ["Illustrative total", "المجموع التوضيحي"],
    ["Price", "السعر"],
    ["Awaiting an agreed quote", "بانتظار عرض سعر متفق عليه"],
    ["Preview availability & quote", "اعرض التوفّر والسعر التوضيحي"],
    ["Confirm sample plan", "أكّد الخطة التجريبية"],
    ["All amounts are made-up demonstration values, not USVI fares, estimates or commercial terms. No platform fee has been agreed.", "جميع المبالغ أمثلة افتراضية، وليست تعرفة أو تقديرات أو شروطاً تجارية في جزر العذراء الأمريكية. ولم يتم الاتفاق على رسوم للمنصة."],
    ["No capacity has been promised. The next step deliberately simulates operator acceptance and an illustrative quote.", "لم يتم ضمان أي سعة. تحاكي الخطوة التالية قبول المشغّل وعرض سعر توضيحي."],
    ["Sample hold expires at", "ينتهي الحجز التجريبي المؤقت عند"],
    ["Recheck the sample hold", "أعد التحقق من الحجز التجريبي"],
    ["Request, not confirmed", "طلب، غير مؤكّد"],
    ["Your sample plan", "خطتك التجريبية"],
    ["trip", "رحلة"],
    ["trips", "رحلات"],
    ["Starts", "تبدأ"],
    ["completed", "مكتملة"],
    ["Plan views", "طرق عرض الخطة"],
    ["Itinerary", "مسار الرحلة"],
    ["Messages", "الرسائل"],
    ["Payments", "المدفوعات"],
    ["All pickup times are St. Thomas local time (AST). Sample people, vehicles and prices. Nothing is sent or reserved. Reloading clears the sample.", "جميع أوقات الالتقاء حسب التوقيت المحلي لسانت توماس (AST). الأشخاص والمركبات والأسعار أمثلة. لا يُرسل أو يُحجز شيء. إعادة تحميل الصفحة تمسح المثال."],
    ["Your selected trip", "الرحلة المحددة"],
    ["Your pickup details are together.", "تفاصيل الالتقاء مجتمعة هنا."],
    ["Request a pickup change", "اطلب تعديل موعد الالتقاء"],
    ["Trip messages", "رسائل الرحلة"],
    ["Book another / reuse this plan", "احجز أخرى / أعد استخدام الخطة"],
    ["Cancellation options", "خيارات الإلغاء"],
    ["The new pickup time conflicts with another booking.", "يتعارض وقت الالتقاء الجديد مع حجز آخر."],
    ["Your change is awaiting review.", "التعديل بانتظار المراجعة."],
    ["stays confirmed. Requested:", "ما زال مؤكداً. الوقت المطلوب:"],
    ["Keep your current arrangement or discuss another time. No schedule has been overwritten.", "أبقِ على الترتيب الحالي أو ناقش وقتاً آخر. لم يتم استبدال أي موعد."],
    ["This example changes the time only. Vehicle capacity and the sample price are retained only after the simulated operator review below.", "يغيّر هذا المثال الوقت فقط. ولا تُحفظ سعة المركبة والسعر التجريبي إلا بعد مراجعة المشغّل المحاكية أدناه."],
    ["Preview operator approval", "عاين موافقة المشغّل"],
    ["Keep the original pickup", "أبقِ على موعد الالتقاء الأصلي"],
    ["Discuss the change", "ناقش التعديل"],
    ["Waiting for a fresh update", "بانتظار تحديث جديد"],
    ["Your example driver is on the way.", "السائق الافتراضي في الطريق."],
    ["Your example driver is at the pickup.", "وصل السائق الافتراضي إلى مكان الالتقاء."],
    ["You're on your way.", "أنت في طريقك."],
    ["This trip is complete.", "اكتملت هذه الرحلة."],
    ["Simulated trip update / not GPS", "تحديث محاكى للرحلة / ليس موقعاً حقيقياً"],
    ["Arrival estimate unavailable. The displayed progress is not current.", "لا يتوفر وقت تقديري للوصول. التقدّم المعروض غير محدّث."],
    ["Trip completion is recorded in your sample itinerary.", "تم تسجيل اكتمال الرحلة في خطتك التجريبية."],
    ["Your pickup instructions and messages stay with this trip. No real location is being tracked.", "تبقى تعليمات الالتقاء والرسائل مع هذه الرحلة. لا يتم تتبّع موقع حقيقي."],
    ["minutes since sample update", "دقيقة منذ آخر تحديث تجريبي"],
    ["Sample update", "تحديث تجريبي"],
    ["min ago", "دقيقة مضت"],
    ["just now", "الآن"],
    ["Advance sample trip", "انتقل إلى تحديث الرحلة التجريبية"],
    ["Viewing this trip", "تعرض هذه الرحلة"],
    ["View this trip", "اعرض هذه الرحلة"],
    ["example vehicles secured", "مركبات افتراضية مؤكدة"],
    ["example lead driver", "السائق الرئيسي الافتراضي"],
    ["seats each. Fictional vehicle references, not an actual fleet.", "مقاعد لكل مركبة. أرقام المركبات افتراضية وليست أسطولاً فعلياً."],
    ["Review the sample assignment before confirming.", "راجع التخصيص التجريبي قبل التأكيد."],
    ["All trips have illustrative operator acceptance. The hold lasts five minutes in this preview. Vehicle and luggage suitability must still be verified in an operating service.", "تم قبول جميع الرحلات افتراضياً من المشغّل. يستمر الحجز المؤقت خمس دقائق في هذه المعاينة. ويبقى التحقق من ملاءمة المركبة والأمتعة ضرورياً في أي خدمة تشغيلية."],
    ["Preview driver on the way", "عاين تحديث أن السائق في الطريق"],
    ["hour reserved-driver window requested", "ساعة من فترة حجز السائق المطلوبة"],
    ["This is a separate paid window, starting at the first pickup, for the number of example vehicles shown in the quote. It does not imply unlimited trips or availability outside that window.", "هذه فترة مدفوعة منفصلة تبدأ عند أول التقاء، وبعدد المركبات الافتراضية الواردة في عرض السعر. ولا تعني رحلات غير محدودة أو توفّراً خارج تلك الفترة."],
    ["Messages stay with the plan. This demonstration does not send anything, record audio or translate your text.", "تبقى الرسائل مع الخطة. لا ترسل هذه المعاينة شيئاً ولا تسجل صوتاً أو تترجم النص."],
    ["Illustrative message", "رسالة توضيحية"],
    ["Sample only / not delivered", "مثال فقط / لم تُرسل"],
    ["Message about your trip", "رسالة عن رحلتك"],
    ["For example: Which entrance should we meet at?", "مثال: عند أي مدخل نلتقي؟"],
    ["Add sample message", "أضف رسالة تجريبية"],
    ["Preview an operator reply", "عاين ردّ المشغّل"],
    ["Voice & language support", "الدعم الصوتي واللغوي"],
    ["Voice messages and language assistance are possibilities to investigate, not confirmed features. Recording, translation and delivery require a connected implementation; they are not represented as working in this local preview.", "الرسائل الصوتية والمساعدة اللغوية إمكانات قيد الدراسة وليست مزايا مؤكدة. يتطلب التسجيل والترجمة والإرسال تنفيذاً متصلاً؛ ولا تعمل هذه الإمكانات في المعاينة المحلية."],
    ["Payment preview / no funds move", "معاينة الدفع / لا تنتقل أي أموال"],
    ["Not paid", "غير مدفوع"],
    ["Payment failed", "تعذّر الدفع"],
    ["Sample deposit paid", "تم تسجيل دفعة مقدّمة تجريبية"],
    ["Sample balance paid", "تم تسجيل الرصيد التجريبي"],
    ["Refund review needed", "تحتاج إلى مراجعة الاسترداد"],
    ["Refund requested / not processed", "طُلب الاسترداد / لم يُعالج"],
    ["Sample refund completed", "اكتمل الاسترداد التجريبي"],
    ["Quote first", "احصل على عرض السعر أولاً"],
    ["Illustrative total for the whole plan, not a published fare, an operator quote or a recommended price.", "مجموع توضيحي للخطة كاملة، وليس تعرفة منشورة أو عرضاً من مشغّل أو سعراً موصى به."],
    ["Capacity and an agreed quote come before payment. There is no amount to pay yet.", "يجب تأكيد السعة والاتفاق على السعر قبل الدفع. لا يوجد مبلغ مستحق الآن."],
    ["Payer", "الدافع"],
    ["Group organizer (example)", "منظّم المجموعة (مثال)"],
    ["Sample payments recorded", "المدفوعات التجريبية المسجّلة"],
    ["Outstanding sample balance", "الرصيد التجريبي المتبقي"],
    ["Not quoted", "لم يصدر عرض سعر"],
    ["Sample refund processed", "الاسترداد التجريبي المنفّذ"],
    ["For illustration, a deposit is half the sample total and the remainder is due before pickup. Actual deposits, cancellation terms and refund eligibility require an operator agreement. No card details are collected.", "للتوضيح فقط، تساوي الدفعة المقدّمة نصف المبلغ التجريبي ويُستحق الباقي قبل الالتقاء. تتطلب الدفعات الفعلية وشروط الإلغاء وأهلية الاسترداد اتفاقاً مع المشغّل. لا تُجمع بيانات البطاقات."],
    ["Preview deposit success", "عاين نجاح الدفعة المقدّمة"],
    ["Preview balance payment", "عاين دفع الرصيد"],
    ["Preview full payment", "عاين دفع المبلغ كاملاً"],
    ["Try a failed payment", "جرّب دفعاً غير ناجح"],
    ["Preview full refund request", "عاين طلب استرداد كامل"],
    ["Preview refund being processed", "عاين معالجة الاسترداد"],
    ["The sample payment did not go through.", "لم تنجح عملية الدفع التجريبية."],
    ["No amount has been added to the paid balance. Review and retry using the controls above. A failed payment is never shown as paid.", "لم يُضف أي مبلغ إلى الرصيد المدفوع. راجع العملية وأعد المحاولة باستخدام الأزرار أعلاه. لا يظهر الدفع غير الناجح على أنه مدفوع."],
    ["Requested is not refunded.", "طلب الاسترداد لا يعني إتمامه."],
    ["This full-refund scenario is awaiting approval and processing. The original payment remains recorded until the sample refund is completed. This is not a promise of refund eligibility or timing.", "سيناريو الاسترداد الكامل بانتظار الموافقة والمعالجة. تبقى الدفعة الأصلية مسجّلة حتى اكتمال الاسترداد التجريبي. وهذا ليس وعداً بأهلية الاسترداد أو توقيته."],
    ["Sample receipt", "إيصال تجريبي"],
    ["refund record", "سجل استرداد"],
    ["no actual transaction.", "لا توجد معاملة فعلية."],
    ["Explore what happens when plans change", "استكشف ما يحدث عند تغيّر الخطط"],
    ["These controls introduce example situations, not actual events. The sample fleet has six 8-seat vans. Scheduling reserves 30 minutes before pickup and 90 minutes per ordinary trip, or the selected tour / reserved duration. These simplified windows are not route estimates or operating rules.", "تعرض هذه الأزرار حالات افتراضية لا أحداثاً حقيقية. يتكوّن الأسطول التجريبي من ست شاحنات صغيرة، سعة كل منها 8 مقاعد. يحجز الجدول 30 دقيقة قبل الالتقاء و90 دقيقة لكل رحلة عادية، أو مدة الجولة / الحجز المختارة. هذه الفترات المبسطة ليست تقديراً للمسارات أو قواعد تشغيل."],
    ["Preferred driver unavailable", "السائق المفضّل غير متاح"],
    ["No suitable vehicle", "لا تتوفر مركبة مناسبة"],
    ["Wedding capacity incomplete", "سعة مجموعة العرس غير مكتملة"],
    ["Driver cancels", "اعتذر السائق"],
    ["Location stops updating", "توقفت تحديثات الموقع"],
    ["Arrival delayed", "تأخر الوصول"],
    ["Change conflicts with another trip", "يتعارض التعديل مع رحلة أخرى"],
    ["Payment & refund states", "حالات الدفع والاسترداد"],
    ["Ask for help", "اطلب المساعدة"],
    ["What has happened in this sample?", "ما الذي حدث في هذا المثال؟"],
    ["Together in one place", "كلها في مكان واحد"],
    ["A service you can explore.", "خدمة يمكنك استكشافها."],
    ["This is an interactive concept, not an operating transport service.", "هذا تصوّر تفاعلي، وليس خدمة نقل تشغيلية."],
    ["All operators, capacity, quotes, messages and trip updates are examples.", "جميع المشغّلين والسعات والأسعار والرسائل وتحديثات الرحلات أمثلة توضيحية."],
    ["No booking, payment, location tracking or message is sent.", "لا يُرسل حجز أو دفع أو تتبّع موقع أو رسالة."],
    ["Sample plans are kept only in memory and disappear when this page reloads.", "تُحفظ الخطط التجريبية في الذاكرة فقط وتختفي عند إعادة تحميل الصفحة."],
    ["Use sample details, not private travel information.", "استخدم تفاصيل تجريبية، لا معلومات سفرك الخاصة."],
    ["Keep at least one trip in the plan.", "أبقِ رحلة واحدة على الأقل في الخطة."],
    ["This preview supports up to twenty trips.", "تدعم هذه المعاينة حتى عشرين رحلة."],
    ["Sample plan confirmed after all assignments and the illustrative quote were accepted. No real booking was made.", "تم تأكيد الخطة التجريبية بعد قبول جميع التخصيصات والسعر التوضيحي. لم يتم إجراء حجز فعلي."],
    ["Sample message added. It has not been delivered to anyone.", "أُضيفت رسالة تجريبية. لم تُرسل إلى أي شخص."],
    ["Change prepared. Your original pickup stays in place until approval.", "تم إعداد التعديل. يبقى موعد الالتقاء الأصلي كما هو إلى حين الموافقة."],
    ["Sample help request added to the conversation. No support team has been contacted; this prototype cannot provide emergency assistance.", "أُضيف طلب مساعدة تجريبي إلى المحادثة. لم يتم التواصل مع فريق دعم، ولا يستطيع هذا النموذج تقديم مساعدة طارئة."],
    ["The preview encountered an unexpected error. No booking or payment was sent. Reload to restart the sample.", "واجهت المعاينة خطأ غير متوقع. لم يُرسل حجز أو دفع. أعد تحميل الصفحة لبدء المثال من جديد."],
    ["The preview could not complete this action. Nothing was sent.", "تعذّر على المعاينة إكمال هذا الإجراء. لم يتم إرسال أي شيء."],
    ["Saving has not been confirmed. Your answers are still here. Retry the same submission; do not start a second response.", "لم يتأكد الحفظ بعد. ما زالت إجاباتك هنا. أعد إرسال الإجابة نفسها، ولا تبدأ إجابة ثانية."],
    ["The server could not accept this response. Your answers are still here. Go back to check them before trying again.", "لم يتمكن الخادم من قبول هذه الإجابة. ما زالت إجاباتك هنا. ارجع لمراجعتها قبل المحاولة مجدداً."],
    ["A pending submission could not be read safely. It has been preserved. Do not start another response until this draft can be recovered.", "تعذّرت قراءة الإجابة قيد الانتظار بأمان، وقد تم الحفاظ عليها. لا تبدأ إجابة أخرى قبل استعادة هذه المسودة."],
    ["Your draft has been restored on this device. Nothing has been sent unless a submission was previously confirmed.", "تمت استعادة مسودتك على هذا الجهاز. لم يُرسل أي شيء ما لم يكن إرسال سابق قد تأكد."],
    ["A saved draft could not be read. It has not been overwritten. Use Clear draft only if you want to discard it and start again.", "تعذّرت قراءة المسودة المحفوظة ولم يتم استبدالها. اختر «امسح المسودة» فقط إذا أردت حذفها والبدء من جديد."],
    ["This browser cannot store a draft. Keep the page open until your response is confirmed.", "لا يستطيع هذا المتصفح حفظ مسودة. أبقِ الصفحة مفتوحة حتى يتأكد إرسال إجابتك."],
    ["The questions could not load. No answers have been sent. Reload this page when connected. A saved HTML file needs the website and its question files to work.", "تعذّر تحميل الأسئلة ولم تُرسل أي إجابات. أعد تحميل الصفحة عند الاتصال. يحتاج ملف HTML المحفوظ إلى الموقع وملفات الأسئلة ليعمل."],
    ["Choose up to ", "اختر حتى "],
    [" answers for this question.", " إجابات لهذا السؤال."],
    ["Choose how you would like to answer this figure.", "اختر الطريقة التي تود الإجابة بها عن هذا الرقم."],
    ["Enter a whole number, including 0, or choose another answer.", "أدخل عدداً صحيحاً، بما في ذلك 0، أو اختر إجابة أخرى."],
    ["Enter a non-negative USD amount with up to two decimal places, including 0, or choose another answer.", "أدخل مبلغاً بالدولار الأمريكي غير سالب وبحد أقصى منزلتين عشريتين، بما في ذلك 0، أو اختر إجابة أخرى."],
    ["Use a figure no larger than 999,999,999, or choose another answer.", "أدخل رقماً لا يتجاوز 999,999,999، أو اختر إجابة أخرى."],
    ["Please keep this answer within ", "يرجى ألا يتجاوز طول هذه الإجابة "],
    [" characters.", " حرفاً."],
    ["Please choose from the displayed answers.", "يرجى الاختيار من الإجابات المعروضة."],
    ["Choose up to three answers.", "اختر حتى ثلاث إجابات."],
    ["Choose either the stand-alone answer or the other answers, not both.", "اختر الإجابة المنفردة أو الإجابات الأخرى، وليس كليهما."],
    ["Choose up to ", "اختر حتى "],
    ["Keep your optional name within 200 characters, or leave it blank.", "اجعل الاسم الاختياري ضمن 200 حرف أو اتركه فارغاً."],
    ["If you would like a follow-up invitation, include a contact method and detail. Otherwise, untick the invitations to submit without contact details.", "إذا رغبت في تلقي دعوة لاحقة، فأضف وسيلة تواصل وتفصيلاً عنها. وإلا فأزل تحديد الدعوات لإرسال إجابتك دون بيانات تواصل."],
    ["Enter a valid email address, or remove it and untick any follow-up invitations to submit without contact details.", "أدخل بريداً إلكترونياً صالحاً، أو احذفه وأزل تحديد الدعوات اللاحقة لإرسال الإجابة دون بيانات تواصل."],
    ["Enter a phone or WhatsApp number, including its area or country code, or remove it and untick any follow-up invitations.", "أدخل رقم هاتف أو واتساب مع رمز المنطقة أو البلد، أو احذفه وأزل تحديد الدعوات اللاحقة."],
    ["An earlier-version draft or pending response remains stored in this browser. It has not been imported or deleted. If it was awaiting confirmation, resolve that earlier response before sending a new one.", "ما زالت هناك مسودة أو إجابة معلّقة من إصدار سابق في هذا المتصفح. لم يتم استيرادها أو حذفها. إذا كانت بانتظار التأكيد، فاحسم أمرها قبل إرسال إجابة جديدة."],
    ["Your latest changes could not be saved on this device. Keep the page open until submission is confirmed.", "تعذّر حفظ آخر تعديلاتك على هذا الجهاز. أبقِ الصفحة مفتوحة حتى يتأكد الإرسال."],
    ["Some questionnaire data could not be removed from this browser. On a shared device, clear this site's browser data when finished.", "تعذّر حذف بعض بيانات الاستبيان من هذا المتصفح. إذا كان الجهاز مشتركاً، فامسح بيانات الموقع من المتصفح عند الانتهاء."],
    ["Retry the pending submission before starting another response. This prevents an accidental duplicate.", "أعد إرسال الإجابة المعلّقة قبل البدء بإجابة أخرى. يمنع ذلك التكرار غير المقصود."],
    ["Clear this questionnaire draft from this browser? Earlier-version drafts will not be changed.", "هل تريد مسح مسودة الاستبيان من هذا المتصفح؟ لن تتغير المسودات المحفوظة من إصدارات سابقة."],
    ["The questionnaire needs JavaScript to display questions and save your answers. No response has been sent.", "يحتاج الاستبيان إلى JavaScript لعرض الأسئلة وحفظ إجاباتك. لم يتم إرسال أي رد."],
    ["The questionnaire could not continue. No new submission is confirmed. Keep this page open and reload only if your draft was saved.", "تعذّر متابعة الاستبيان. لم يتأكد إرسال أي إجابة جديدة. أبقِ الصفحة مفتوحة ولا تعِد تحميلها إلا إذا كانت مسودتك محفوظة."],
    ["Our best work starts", "أفضل ما نقدّمه يبدأ"],
    ["with understanding yours.", "بفهم عملك."],
    ["St. Thomas", "سانت توماس"],
    ["VI Taxi Operator Research", "بحث مشغّلي سيارات الأجرة في جزر العذراء"],
    ["Proposed transportation service", "خدمة نقل مقترحة"],
    ["Choose a valid date for every trip.", "اختر تاريخاً صالحاً لكل رحلة."],
    ["Choose a valid pickup time for every trip.", "اختر وقتاً صالحاً للالتقاء في كل رحلة."],
    ["Choose today or a future date. A past pickup cannot be reserved.", "اختر اليوم أو تاريخاً لاحقاً. لا يمكن حجز موعد التقاء مضى."],
    ["That pickup time has passed. Choose a later time.", "مضى وقت الالتقاء هذا. اختر وقتاً لاحقاً."],
    ["This sample plan could not be found.", "تعذّر العثور على هذه الخطة التجريبية."],
    ["Select a trip from this plan.", "اختر رحلة من هذه الخطة."],
    ["Choose a service.", "اختر خدمة."],
    ["Add between one and twenty trips.", "أضف من رحلة واحدة إلى عشرين رحلة."],
    ["Add a pickup and destination for every trip.", "أضف مكان الالتقاء والوجهة لكل رحلة."],
    ["Each trip needs a whole guest count between 1 and 200.", "تحتاج كل رحلة إلى عدد صحيح من الركّاب بين 1 و200."],
    ["Pickup and destination should be different.", "يجب أن يختلف مكان الالتقاء عن الوجهة."],
    ["Choose one of the sample tour durations.", "اختر إحدى مدد الجولة التجريبية."],
    ["Choose a listed reserved-driver window.", "اختر إحدى فترات حجز السائق المعروضة."],
    ["Use a whole luggage count between 0 and 200.", "أدخل عدداً صحيحاً للأمتعة بين 0 و200."],
    ["Choose a listed sample driver.", "اختر أحد السائقين الافتراضيين المعروضين."],
    ["Choose a listed demonstration scenario.", "اختر أحد سيناريوهات العرض."],
    ["Choose a plan view.", "اختر طريقة عرض للخطة."],
    ["This plan is no longer at the availability step.", "لم تعد هذه الخطة في مرحلة التحقق من التوفّر."],
    ["This plan needs operator review.", "تحتاج هذه الخطة إلى مراجعة المشغّل."],
    ["Nothing is confirmed.", "لم يتم تأكيد أي شيء."],
    ["This trip cannot advance from its current status.", "لا يمكن نقل هذه الرحلة إلى المرحلة التالية من حالتها الحالية."],
    ["There is no change awaiting review.", "لا يوجد تعديل بانتظار المراجعة."],
    ["The original arrangement stays in place.", "يبقى الترتيب الأصلي كما هو."],
    ["The assigned vehicle is committed at that time. Your original pickup stays confirmed.", "المركبة المخصصة ملتزمة في ذلك الوقت. يبقى موعد الالتقاء الأصلي مؤكداً."],
    ["There is no pending change.", "لا يوجد تعديل معلّق."],
    ["Use an unfinished sample plan for this scenario.", "استخدم خطة تجريبية غير مكتملة لهذا السيناريو."],
    ["Resolve the pending schedule change first.", "احسم تعديل الموعد المعلّق أولاً."],
    ["Try availability scenarios before confirming a plan.", "جرّب سيناريوهات التوفّر قبل تأكيد الخطة."],
    ["Choose a preferred driver in a new plan to try this scenario.", "اختر سائقاً مفضّلاً في خطة جديدة لتجربة هذا السيناريو."],
    ["Use a wedding plan to explore an unsecured pickup group.", "استخدم خطة عرس لاستكشاف مجموعة التقاء غير مؤكدة."],
    ["This issue needs a different resolution.", "تحتاج هذه المشكلة إلى طريقة أخرى لحلها."],
    ["A paid, canceled sample plan is needed for a refund.", "يتطلب الاسترداد خطة تجريبية ملغاة ومدفوعة."],
    ["Write a sample message first.", "اكتب رسالة تجريبية أولاً."],
    ["Choose a new future date before rebooking.", "اختر تاريخاً جديداً في المستقبل قبل إعادة الحجز."],
    ["This plan needs a different resolution.", "تحتاج هذه الخطة إلى طريقة أخرى للحل."],
    ["Message", "الرسالة"],
    ["Trip name is too long.", "اسم الرحلة طويل جداً."],
    ["Pickup is too long.", "مكان الالتقاء طويل جداً."],
    ["Destination is too long.", "الوجهة طويلة جداً."],
    ["Details is too long.", "التفاصيل طويلة جداً."],
    ["Arrival reference is too long.", "مرجع الوصول طويل جداً."],
    ["A clear way to get around St. Thomas", "طريقة واضحة للتنقّل في سانت توماس"],
    ["More than the ride there", "أكثر من مجرد رحلة إلى وجهتك"],
    ["Accessibility", "إمكانية الوصول"],
    ["Original pickup", "موعد الالتقاء الأصلي"],
    ["Scheduled pickup", "موعد الالتقاء المحدد"],
    ["Email / WhatsApp", "البريد الإلكتروني / واتساب"]
    ,["A dinner reservation, the beach, or the next stop in your day.", "موعد عشاء أو الشاطئ أو المحطة التالية في يومك."]
    ,["Accessible vehicle suitability needs operator review. This preview will not assume a suitable vehicle.", "تحتاج ملاءمة المركبة المهيأة إلى مراجعة المشغّل. لن تفترض هذه المعاينة توفر مركبة مناسبة."]
    ,["A vehicle now has a conflicting commitment. Recheck availability.", "أصبحت المركبة ملتزمة في موعد متعارض. أعد التحقق من التوفّر."]
    ,["Add a return, note your luggage, and request a familiar driver. Availability still needs to be secured.", "أضف رحلة عودة، وسجّل أمتعتك، واطلب سائقاً تعرفه. يبقى التوفّر بحاجة إلى تأكيد."]
    ,["Add your flight or ferry details. An arrival delay should become a reviewed change, not a missed pickup.", "أضف تفاصيل رحلتك الجوية أو البحرية. ينبغي مراجعة تأخر الوصول كتعديل، لا أن يؤدي إلى فوات الالتقاء."]
    ,["Advance a trip to a pickup update before trying stale location.", "حدّث حالة الرحلة إلى الالتقاء قبل تجربة سيناريو الموقع غير المحدّث."]
    ,["All amounts are made-up demonstration values, not USVI fares, estimates or commercial terms. No platform fee has been agreed.", "جميع المبالغ أمثلة افتراضية، وليست تعرفة أو تقديرات أو شروطاً تجارية في جزر العذراء الأمريكية. ولم يتم الاتفاق على رسوم للمنصة."]
    ,["Arrival estimate unavailable. The displayed progress is not current.", "لا يتوفر وقت تقديري للوصول. التقدّم المعروض غير محدّث."]
    ,["At least one group needs more eligible capacity. The whole event remains unconfirmed; accepted resources cannot be assumed or double-booked.", "تحتاج مجموعة واحدة على الأقل إلى سعة مؤهلة إضافية. تبقى الفعالية كلها غير مؤكدة؛ ولا يجوز افتراض الموارد المقبولة أو حجزها مرتين."]
    ,["Availability check found insufficient sample capacity or an unavailable preferred lead driver.", "كشف التحقق من التوفّر عن نقص في السعة التجريبية أو عدم توفّر السائق الرئيسي المفضّل."]
    ,["Capacity and an agreed quote come before payment. There is no amount to pay yet.", "يجب تأكيد السعة والاتفاق على السعر قبل الدفع. لا يوجد مبلغ مستحق الآن."]
    ,["Changes in this preview are available before the selected trip starts.", "يمكن طلب التغييرات في هذه المعاينة قبل بدء الرحلة المحددة."]
    ,["Choose an available alternative explicitly, or keep the request open.", "اختر بوضوح بديلاً متاحاً، أو اترك الطلب مفتوحاً."]
    ,["Choose an example route, allow time to explore, and keep your group together.", "اختر مساراً افتراضياً واترك وقتاً للاستكشاف وحافظ على بقاء مجموعتك معاً."]
    ,["Choose today or a future date. A past pickup cannot be reserved.", "اختر اليوم أو تاريخاً لاحقاً. لا يمكن حجز موعد التقاء مضى."]
    ,["Confirm sample capacity and pricing before previewing payment.", "أكّد السعة التجريبية والسعر قبل معاينة الدفع."]
    ,["Describe your requested stops. A custom route would need operator review, not instant confirmation.", "صف المحطات التي تطلبها. يحتاج المسار المخصص إلى مراجعة المشغّل، وليس إلى تأكيد فوري."]
    ,["Each pickup wave needs accepted vehicle capacity. This preview will not call the whole event confirmed if one group is still unsecured.", "تحتاج كل مجموعة التقاء إلى سعة مركبات مقبولة. لن تعتبر هذه المعاينة الفعالية كلها مؤكدة إذا بقيت مجموعة واحدة بلا ترتيب مضمون."]
    ,["Every trip needs accepted vehicle capacity before the whole plan can be confirmed.", "تحتاج كل رحلة إلى سعة مركبات مقبولة قبل تأكيد الخطة كاملة."]
    ,["Example help request: please review the pickup and any open assignment or timing issue.", "طلب مساعدة افتراضي: يرجى مراجعة الالتقاء وأي مشكلة مفتوحة في التخصيص أو التوقيت."]
    ,["Example reply: we would confirm the exact meeting point and any revised arrangements here. This text is scripted, not a live operator response.", "رد افتراضي: سنؤكد هنا مكان الالتقاء الدقيق وأي ترتيبات معدّلة. هذا نص مكتوب مسبقاً، وليس رداً مباشراً من مشغّل."]
    ,["Guest confirmed the illustrative quote and all sample assignments.", "أكّد الضيف السعر التوضيحي وجميع التخصيصات التجريبية."]
    ,["Illustrative operator acceptance and quote prepared; temporary sample capacity held.", "تم إعداد قبول افتراضي من المشغّل وعرض سعر توضيحي؛ وحُجزت سعة تجريبية مؤقتاً."]
    ,["Illustrative total for the whole plan, not a published fare, an operator quote or a recommended price.", "مجموع توضيحي للخطة كاملة، وليس تعرفة منشورة أو عرضاً من مشغّل أو سعراً موصى به."]
    ,["Keep arrival details, luggage and the onward journey together.", "اجمع تفاصيل الوصول والأمتعة والرحلة التالية في مكان واحد."]
    ,["Keep the request open, or choose another example driver. Your preference will not be silently replaced.", "اترك الطلب مفتوحاً أو اختر سائقاً افتراضياً آخر. لن يُستبدل تفضيلك من دون إبلاغك."]
    ,["Keep your current arrangement or discuss another time. No schedule has been overwritten.", "أبقِ على الترتيب الحالي أو ناقش وقتاً آخر. لم يتم استبدال أي موعد."]
    ,["No capacity has been promised. The next step deliberately simulates operator acceptance and an illustrative quote.", "لم يتم ضمان أي سعة. تحاكي الخطوة التالية قبول المشغّل وعرض سعر توضيحي."]
    ,["Nothing is confirmed. You can try another time or ask for help. The control below deliberately simulates capacity becoming available.", "لم يتم تأكيد أي شيء. يمكنك تجربة وقت آخر أو طلب المساعدة. يحاكي الزر أدناه عمداً توفّر سعة."]
    ,["Pickup change requested; original arrangement retained.", "طُلب تعديل موعد الالتقاء؛ وبقي الترتيب الأصلي كما هو."]
    ,["Plan each arrival, outing and departure with your group. This example arranges transportation, not lodging.", "خطط لكل وصول ونزهة ومغادرة مع مجموعتك. يرتب هذا المثال النقل، لا الإقامة."]
    ,["Plan each pickup group and return. The whole plan needs the right vehicles, not just the first trip.", "رتّب كل مجموعة التقاء ورحلة عودة. تحتاج الخطة كلها إلى المركبات المناسبة، لا الرحلة الأولى وحدها."]
    ,["Preferences copied into a new request. Dates, availability and pricing must be reviewed again; the existing plan is unchanged.", "نُقلت التفضيلات إلى طلب جديد. يجب مراجعة التواريخ والتوفّر والأسعار مجدداً؛ ولم تتغير الخطة الحالية."]
    ,["Resolve the existing request or issue before adding another change.", "احسم الطلب أو المشكلة الحالية قبل إضافة تعديل آخر."]
    ,["Sample help request added to the conversation. No support team has been contacted; this prototype cannot provide emergency assistance.", "أُضيف طلب مساعدة تجريبي إلى المحادثة. لم يتم التواصل مع فريق دعم، ولا يستطيع هذا النموذج تقديم مساعدة طارئة."]
    ,["Sample issue resolved with an explicit updated assignment or fresh signal.", "تم حل المشكلة التجريبية بتخصيص محدّث بوضوح أو بإشارة جديدة."]
    ,["Sample message added. It has not been delivered to anyone.", "أُضيفت رسالة تجريبية. لم تُرسل إلى أي شخص."]
    ,["Sample plan canceled. Refund eligibility still requires review.", "أُلغيت الخطة التجريبية. وما زالت أهلية استرداد المبلغ بحاجة إلى مراجعة."]
    ,["Sample plan confirmed after all assignments and the illustrative quote were accepted. No real booking was made.", "تم تأكيد الخطة التجريبية بعد قبول جميع التخصيصات والسعر التوضيحي. لم يتم إجراء حجز فعلي."]
    ,["Simulated operator review completed. Revised pickup accepted with the same sample price and capacity.", "اكتملت مراجعة المشغّل المحاكية. وتم قبول موعد الالتقاء المعدّل بالسعر والسعة التجريبيين نفسيهما."]
    ,["Temporary sample hold expired. Availability and the quote need rechecking.", "انتهى الحجز التجريبي المؤقت. يجب إعادة التحقق من التوفّر والسعر."]
    ,["That replacement is not available for the full trip. The original assignment remains unsecured.", "هذا البديل غير متاح للرحلة كاملة. وما زال التخصيص الأصلي غير مضمون."]
    ,["The affected assignment is no longer confirmed. Other trips stay in your itinerary. Review and accept a replacement before the pickup continues.", "لم يعد التخصيص المتأثر مؤكداً. وتبقى الرحلات الأخرى في خطتك. راجع البديل واقبله قبل متابعة الالتقاء."]
    ,["The assigned vehicle is committed at that time. Your original pickup stays confirmed.", "المركبة المخصصة ملتزمة في ذلك الوقت. يبقى موعد الالتقاء الأصلي مؤكداً."]
    ,["The last sample location is more than 10 minutes old. There is no reliable arrival estimate until a fresh update or human confirmation is received.", "مرّ أكثر من 10 دقائق على آخر موقع تجريبي. لا يتوفر وقت موثوق للوصول حتى يرد تحديث جديد أو تأكيد من شخص."]
    ,["The new time conflicts with another booking. The original arrangement stays in place.", "يتعارض الوقت الجديد مع حجز آخر. يبقى الترتيب الأصلي كما هو."]
    ,["The preview could not complete this action. Nothing was sent.", "تعذّر على المعاينة إكمال هذا الإجراء. لم يتم إرسال أي شيء."]
    ,["The preview encountered an unexpected error. No booking or payment was sent. Reload to restart the sample.", "واجهت المعاينة خطأ غير متوقع. لم يُرسل حجز أو دفع. أعد تحميل الصفحة لبدء المثال من جديد."]
    ,["The sample hold expired. Recheck availability before confirming.", "انتهى الحجز التجريبي المؤقت. أعد التحقق من التوفّر قبل التأكيد."]
    ,["The sample location is now stale. A fresh update or human confirmation is needed.", "لم يعد الموقع التجريبي حديثاً. نحتاج إلى تحديث جديد أو تأكيد من شخص."]
    ,["These are example itineraries, not an operator's published tour. Changes to duration or stops need a fresh availability and price review.", "هذه مسارات افتراضية وليست جولة منشورة من مشغّل. تتطلب تغييرات المدة أو المحطات مراجعة جديدة للتوفّر والسعر."]
    ,["This example changes the time only. Vehicle capacity and the sample price are retained only after the simulated operator review below.", "يغيّر هذا المثال الوقت فقط. ولا تُحفظ سعة المركبة والسعر التجريبي إلا بعد مراجعة المشغّل المحاكية أدناه."]
    ,["This luggage load needs a vehicle-fit review before capacity can be held.", "تحتاج هذه الأمتعة إلى مراجعة ملاءمة المركبة قبل حجز السعة."]
    ,["Use a wedding plan to explore an unsecured pickup group.", "استخدم خطة عرس لاستكشاف مجموعة التقاء غير مؤكدة."]
    ,["Your group can plan separate arrivals and outings. A preferred driver is a request, not exclusive on-call availability.", "يمكن لمجموعتك ترتيب وصولات ونزهات منفصلة. طلب سائق مفضّل لا يعني توفره حصرياً عند الطلب."]
    ,["Your pickup instructions and messages stay with this trip. No real location is being tracked.", "تبقى تعليمات الالتقاء والرسائل مع هذه الرحلة. لا يتم تتبّع موقع حقيقي."]
    ,["Your trip details stay with this plan. This conversation is a demonstration; no one receives these messages.", "تبقى تفاصيل الرحلة ضمن هذه الخطة. هذه المحادثة للعرض فقط ولا تصل الرسائل إلى أحد."]
    ,["The server could not accept this response. Your answers are still here. Go back to check them before trying again.", "لم يتمكن الخادم من قبول هذه الإجابة. ما زالت إجاباتك هنا. ارجع لمراجعتها قبل المحاولة مجدداً."]
    ,["The questions could not load. No answers have been sent. Reload this page when connected. A saved HTML file needs the website and its question files to work.", "تعذّر تحميل الأسئلة ولم تُرسل أي إجابات. أعد تحميل الصفحة عند الاتصال. يحتاج ملف HTML المحفوظ إلى الموقع وملفات الأسئلة ليعمل."]
    ,["Earlier draft status could not be checked. Any older questionnaire drafts have not been changed.", "تعذّر التحقق من حالة المسودة السابقة. لم تتغير أي مسودات قديمة للاستبيان."]
    ,["This submission cannot be saved for retry after closing the page. Keep this page open until saving is confirmed.", "لا يمكن حفظ هذه الإجابة لإعادة المحاولة بعد إغلاق الصفحة. أبقِ الصفحة مفتوحة حتى يتأكد الحفظ."]
    ,["Based on your earlier answer, there is no recently used service to describe here. Continue to the next section, or go back if you would like to change that answer.", "بناءً على إجابتك السابقة، لا توجد خدمة استخدمتها مؤخراً لوصفها هنا. تابع إلى القسم التالي، أو ارجع إذا رغبت في تعديل إجابتك."]
    ,["Your earlier-version draft has been restored with its original questions. Your answers have not been reinterpreted. Nothing has been sent unless a submission was previously confirmed.", "تمت استعادة مسودتك من إصدار سابق بأسئلتها الأصلية. لم يُعاد تفسير إجاباتك. لم يتم إرسال شيء ما لم يكن إرسال سابق قد تأكد."]
    ,["Your draft has been restored on this device. Nothing has been sent unless a submission was previously confirmed.", "تمت استعادة مسودتك على هذا الجهاز. لم يُرسل أي شيء ما لم يكن إرسال سابق قد تأكد."]
    ,["A pending submission could not be read safely. It has been preserved. Do not start another response until this draft can be recovered.", "تعذّرت قراءة الإجابة قيد الانتظار بأمان، وقد تم الحفاظ عليها. لا تبدأ إجابة أخرى قبل استعادة هذه المسودة."]
    ,["A saved draft could not be read. It has not been overwritten. Use Clear draft only if you want to discard it and start again.", "تعذّرت قراءة المسودة المحفوظة ولم يتم استبدالها. اختر «امسح المسودة» فقط إذا أردت حذفها والبدء من جديد."]
    ,["An earlier-version draft or pending response remains stored in this browser. It has not been imported or deleted. If it was awaiting confirmation, resolve that earlier response before sending a new one.", "ما زالت هناك مسودة أو إجابة معلّقة من إصدار سابق في هذا المتصفح. لم يتم استيرادها أو حذفها. إذا كانت بانتظار التأكيد، فاحسم أمرها قبل إرسال إجابة جديدة."]
    ,["Choose either the stand-alone answer or the other answers, not both.", "اختر الإجابة المنفردة أو الإجابات الأخرى، وليس كليهما."]
    ,["Choose how you would like to answer this figure.", "اختر الطريقة التي تود الإجابة بها عن هذا الرقم."]
    ,["Clear this questionnaire draft from this browser? Earlier-version drafts will not be changed.", "هل تريد مسح مسودة الاستبيان من هذا المتصفح؟ لن تتغير المسودات المحفوظة من إصدارات سابقة."]
    ,["Confirmation is still pending. Retry sends the same response with the same reference, not a second research response.", "لم يصل التأكيد بعد. إعادة المحاولة ترسل الإجابة نفسها بالمرجع نفسه، ولا تنشئ إجابة بحثية ثانية."]
    ,["Enter a non-negative USD amount with up to two decimal places, including 0, or choose another answer.", "أدخل مبلغاً بالدولار الأمريكي غير سالب وبحد أقصى منزلتين عشريتين، بما في ذلك 0، أو اختر إجابة أخرى."]
    ,["Enter a phone or WhatsApp number, including its area or country code, or remove it and untick any follow-up invitations.", "أدخل رقم هاتف أو واتساب مع رمز المنطقة أو البلد، أو احذفه وأزل تحديد الدعوات اللاحقة."]
    ,["Enter a valid email address, or remove it and untick any follow-up invitations to submit without contact details.", "أدخل بريداً إلكترونياً صالحاً، أو احذفه وأزل تحديد الدعوات اللاحقة لإرسال الإجابة دون بيانات تواصل."]
    ,["Enter a whole number, including 0, or choose another answer.", "أدخل عدداً صحيحاً، بما في ذلك 0، أو اختر إجابة أخرى."]
    ,["If you would like a follow-up invitation, include a contact method and detail. Otherwise, untick the invitations to submit without contact details.", "إذا رغبت في تلقي دعوة لاحقة، فأضف وسيلة تواصل وتفصيلاً عنها. وإلا فأزل تحديد الدعوات لإرسال إجابتك دون بيانات تواصل."]
    ,["Keep your optional name within 200 characters, or leave it blank.", "اجعل الاسم الاختياري ضمن 200 حرف أو اتركه فارغاً."]
    ,["Retry the pending submission before starting another response. This prevents an accidental duplicate.", "أعد إرسال الإجابة المعلّقة قبل البدء بإجابة أخرى. يمنع ذلك التكرار غير المقصود."]
    ,["Review your answers before sending. You can go back, change anything, or leave questions unanswered.", "راجع إجاباتك قبل الإرسال. يمكنك الرجوع وتعديل أي شيء أو ترك الأسئلة بلا إجابة."]
    ,["Saving has not been confirmed. Your answers are still here. Retry the same submission; do not start a second response.", "لم يتأكد الحفظ بعد. ما زالت إجاباتك هنا. أعد إرسال الإجابة نفسها، ولا تبدأ إجابة ثانية."]
    ,["Sharing your details does not automatically give us permission to contact you. Choose an invitation below only if you would like one; include a contact detail if you do.", "مشاركة بياناتك لا تمنحنا تلقائياً الإذن بالتواصل معك. اختر دعوة أدناه فقط إذا رغبت بها، وأضف وسيلة تواصل عندئذ."]
    ,["Some questionnaire data could not be removed from this browser. On a shared device, clear this site's browser data when finished.", "تعذّر حذف بعض بيانات الاستبيان من هذا المتصفح. إذا كان الجهاز مشتركاً، فامسح بيانات الموقع من المتصفح عند الانتهاء."]
    ,["Submitting sends these answers to ETA. No booking, payment or subscription is created.", "إرسال هذه الإجابات يرسلها إلى ETA. لن يُنشأ حجز أو دفعة أو اشتراك."]
    ,["The questionnaire could not continue. No new submission is confirmed. Keep this page open and reload only if your draft was saved.", "تعذّر متابعة الاستبيان. لم يتأكد إرسال أي إجابة جديدة. أبقِ الصفحة مفتوحة ولا تعِد تحميلها إلا إذا كانت مسودتك محفوظة."]
    ,["Use a figure no larger than 999,999,999, or choose another answer.", "أدخل رقماً لا يتجاوز 999,999,999، أو اختر إجابة أخرى."]
    ,["You do not have to share either. Prefer not to? Thank you for taking the time to help.", "لست ملزماً بمشاركة أي منهما. وإن فضّلت عدم ذلك، فنشكرك على وقتك ومساعدتك."]
    ,["Your answers are saved. Your experience will help us decide where a different approach could genuinely support operators.", "تم حفظ إجاباتك. ستساعدنا خبرتك على تحديد المجالات التي يمكن فيها لنهج مختلف أن يدعم المشغّلين فعلياً."]
    ,["Your experience helps us understand what could make operators' work easier and more profitable. If you'd like us to know who these answers came from, you're welcome to leave your name and contact details below.", "تساعدنا خبرتك على فهم ما قد يجعل عمل المشغّلين أسهل وأكثر جدوى. إذا رغبت في إخبارنا بهويتك، يمكنك كتابة اسمك وبيانات التواصل أدناه."]
    ,["Your latest changes could not be saved on this device. Keep the page open until submission is confirmed.", "تعذّر حفظ آخر تعديلاتك على هذا الجهاز. أبقِ الصفحة مفتوحة حتى يتأكد الإرسال."]
    ,["Main navigation", "التنقّل الرئيسي"]
    ,["My plans", "خططي"]
    ,["Just looking? Take a sample ride", "تتصفّح فقط؟ جرّب رحلة تجريبية"]
    ,["My island week", "أسبوعي في الجزيرة"]
    ,["Trip", "رحلة"]
    ,["to", "إلى"]
    ,["Questionnaire responses are saved when submission is confirmed.", "تُحفظ إجابات الاستبيان عند تأكيد الإرسال."]
    ,["Page ", "الصفحة "]
    ,[" of ", " من "]
    ,["How to answer", "طريقة الإجابة"]
    ,[": how to answer", ": طريقة الإجابة"]
    ,["No suitable vehicle is available.", "لا تتوفر مركبة مناسبة."]
    ,["Nothing is confirmed. You can try another time or ask for help. The control below deliberately simulates capacity becoming available.", "لم يتم تأكيد أي شيء. يمكنك تجربة وقت آخر أو طلب المساعدة. يحاكي الزر أدناه عمداً توفّر سعة."]
    ,["The complete pickup plan is not secured.", "خطة الالتقاء كاملة غير مضمونة."]
    ,["Your preferred driver is unavailable.", "السائق المفضّل غير متاح."]
    ,["Your driver can no longer make this trip.", "لم يعد السائق قادراً على تنفيذ هذه الرحلة."]
    ,["Location updates have stopped.", "توقفت تحديثات الموقع."]
    ,["Keep the request open / ask for help", "اترك الطلب مفتوحاً / اطلب المساعدة"]
    ,["Preview capacity becoming available", "عاين توفّر السعة"]
    ,["Choose another time", "اختر وقتاً آخر"]
    ,["Recheck the sample fleet", "أعد التحقق من الأسطول الافتراضي"]
    ,["Ask about the missing capacity", "استفسر عن السعة الناقصة"]
    ,["Accept ", "اقبل "]
    ,[" as replacement", " كبديل"]
    ,["Preview a fresh update", "عاين تحديثاً جديداً"]
    ,["Ask for a pickup update", "اطلب تحديثاً عن الالتقاء"]
    ,["Arrangement needs attention", "الترتيب يتطلب الانتباه"]
    ,["Request a new pickup time", "اطلب وقتاً جديداً للالتقاء"]
    ,["The current pickup stays in place until the change is accepted. If cost or capacity changes, it would need separate agreement.", "يبقى موعد الالتقاء الحالي كما هو حتى قبول التعديل. وإذا تغيّرت الكلفة أو السعة، فسيحتاج ذلك إلى اتفاق منفصل."]
    ,["Prepare sample change", "أعدّ التعديل التجريبي"]
    ,["Your example driver is on the way.", "السائق الافتراضي في الطريق."]
    ,["Your example driver is at the pickup.", "وصل السائق الافتراضي إلى مكان الالتقاء."]
    ,["You're on your way.", "أنت في طريقك."]
    ,["This trip is complete.", "اكتملت هذه الرحلة."]
    ,["Sample trip progress", "تقدّم الرحلة التجريبية"]
    ,["Trips in this plan", "الرحلات ضمن هذه الخطة"]
    ,["Your selected trip", "الرحلة المحددة"]
    ,["Your pickup details are together.", "تفاصيل الالتقاء مجتمعة هنا."]
    ,["Preview driver on the way", "عاين تحديث أن السائق في الطريق"]
    ,["hour reserved-driver window requested", "ساعة من فترة حجز السائق المطلوبة"]
    ,["Request a pickup change", "اطلب تعديل موعد الالتقاء"]
    ,["Trip messages", "رسائل الرحلة"]
    ,["Book another / reuse this plan", "احجز أخرى / أعد استخدام الخطة"]
    ,["Cancellation options", "خيارات الإلغاء"]
    ,["No preference", "لا تفضيل"]
    ,["Airport arrival", "الوصول إلى المطار"]
    ,["Arrival transfer", "تنقّل الوصول"]
    ,["Local ride", "رحلة محلية"]
    ,["Additional guest group", "مجموعة ضيوف إضافية"]
    ,["Return trip", "رحلة عودة"]
    ,["No live operator system or bookings.", "لا يوجد نظام تشغيلي للمشغّلين أو حجوزات فعلية."]
    ,["No booking, payment or subscription is created.", "لن يُنشأ حجز أو دفعة أو اشتراك."]
    ,["A useful service starts with your working reality.", "الخدمة المفيدة تبدأ بفهم واقع عملك."]
    ,["STT →", "المطار ←"]
    ,["Change withdrawn. Original pickup retained.", "تم سحب التعديل. بقي موعد الالتقاء الأصلي."]
    ,["Choose a different pickup date or time.", "اختر تاريخاً أو وقتاً مختلفاً للالتقاء."]
    ,["Choose a listed reserved-driver window.", "اختر إحدى فترات حجز السائق المعروضة."]
    ,["Choose a listed sample driver.", "اختر أحد السائقين الافتراضيين المعروضين."]
    ,["Choose a new future date before rebooking.", "اختر تاريخاً جديداً في المستقبل قبل إعادة الحجز."]
    ,["Choose a valid date for every trip.", "اختر تاريخاً صالحاً لكل رحلة."]
    ,["Choose a valid pickup time for every trip.", "اختر وقتاً صالحاً للالتقاء في كل رحلة."]
    ,["Choose one of the sample tour durations.", "اختر إحدى مدد الجولة التجريبية."]
    ,["Choose the listed replacement explicitly.", "اختر البديل المعروض بوضوح."]
    ,["Confirm a plan and select an unfinished trip first.", "أكّد الخطة واختر أولاً رحلة لم تنتهِ."]
    ,["Each trip needs a whole guest count between 1 and 200.", "تحتاج كل رحلة إلى عدد صحيح من الركّاب بين 1 و200."]
    ,["For example: Which entrance should we meet at?", "مثال: عند أي مدخل نلتقي؟"]
    ,["Illustrative full refund completed. No funds moved.", "اكتمل الاسترداد الكامل التوضيحي. لم تنتقل أي أموال."]
    ,["Illustrative full refund requested, not yet processed.", "طُلب استرداد كامل توضيحي، ولم تتم معالجته بعد."]
    ,["Illustrative payment failed. No paid balance changed.", "تعذّر الدفع التوضيحي. لم يتغير الرصيد المدفوع."]
    ,["Illustrative payment recorded. No funds moved.", "تم تسجيل الدفع التوضيحي. لم تنتقل أي أموال."]
    ,["Keep at least one trip in the plan.", "أبقِ رحلة واحدة على الأقل في الخطة."]
    ,["Keep the pickup and return as separate trips.", "اجعل الالتقاء والعودة رحلتين منفصلتين."]
    ,["Only an unstarted sample plan can be canceled here.", "يمكن إلغاء خطة تجريبية لم تبدأ بعد فقط."]
    ,["Pickup and destination should be different.", "يجب أن يختلف مكان الالتقاء عن الوجهة."]
    ,["Request a sample refund before completing it.", "اطلب استرداداً تجريبياً قبل إتمامه."]
    ,["Resolve the availability issue before continuing.", "حل مشكلة التوفّر قبل المتابعة."]
    ,["Resolve the open issue before confirming.", "حل المشكلة المفتوحة قبل التأكيد."]
    ,["Resolve the open trip issue before continuing.", "حل مشكلة الرحلة المفتوحة قبل المتابعة."]
    ,["Resolve the pending schedule change first.", "احسم تعديل الموعد المعلّق أولاً."]
    ,["Resolve the trip issue before approving a change.", "حل مشكلة الرحلة قبل الموافقة على التعديل."]
    ,["Review available capacity and the sample quote first.", "راجع السعة المتاحة والسعر التجريبي أولاً."]
    ,["Sample request prepared. No operator contacted.", "تم إعداد طلب تجريبي. لم يتم التواصل مع أي مشغّل."]
    ,["Secure the plan before starting a trip update.", "أكّد الخطة قبل بدء تحديث الرحلة."]
    ,["Separate groups can have their own vehicles and times.", "يمكن تخصيص مركبات ومواعيد منفصلة للمجموعات."]
    ,["That preview action is not available.", "إجراء المعاينة هذا غير متاح."]
    ,["The sample balance is already paid.", "تم دفع الرصيد التجريبي بالفعل."]
    ,["The sample hold has expired. Check availability again.", "انتهى الحجز التجريبي المؤقت. تحقق من التوفّر مجدداً."]
    ,["There is no change awaiting review.", "لا يوجد تعديل بانتظار المراجعة."]
    ,["There is no open issue to resolve.", "لا توجد مشكلة مفتوحة لحلها."]
    ,["This plan is no longer at the availability step.", "لم تعد هذه الخطة في مرحلة التحقق من التوفّر."]
    ,["This preview supports up to twenty trips.", "تدعم هذه المعاينة حتى عشرين رحلة."]
    ,["This sample payment is in a refund process.", "عملية الدفع التجريبية هذه قيد الاسترداد."]
    ,["This sample plan could not be found.", "تعذّر العثور على هذه الخطة التجريبية."]
    ,["This sample refund is not awaiting a request.", "هذا الاسترداد التجريبي لا ينتظر طلباً."]
    ,["This trip cannot advance from its current status.", "لا يمكن نقل هذه الرحلة إلى المرحلة التالية من حالتها الحالية."]
    ,["This trip has already started.", "بدأت هذه الرحلة بالفعل."]
    ,["Trip completion is recorded in your sample itinerary.", "تم تسجيل اكتمال الرحلة في خطتك التجريبية."]
    ,["Try availability scenarios before confirming a plan.", "جرّب سيناريوهات التوفّر قبل تأكيد الخطة."]
    ,["Use a whole luggage count between 0 and 200.", "أدخل عدداً صحيحاً للأمتعة بين 0 و200."]
    ,["Use an unfinished sample plan for this scenario.", "استخدم خطة تجريبية غير مكتملة لهذا السيناريو."]
    ,["Use sample details for this preview.", "استخدم تفاصيل تجريبية في هذه المعاينة."]
    ,["Your change is awaiting review.", "التعديل بانتظار المراجعة."]
    ,["Scenario: ", "السيناريو: "]
    ,[" is too long.", " أطول من اللازم."]
    ,["Choose a listed sample driver.", "اختر أحد السائقين الافتراضيين المعروضين."]
    ,["Retry sends the same response with the same reference, not a second research response.", "تعيد المحاولة إرسال الإجابة نفسها بالمرجع ذاته، ولا تنشئ إجابة بحثية ثانية."]
    ,["The guest and partnership experiences are prototypes, not operating transportation services.", "تجربتا الضيوف والشراكة نموذجين أوليين وليستا خدمتي نقل تشغيليتين."]
    ,["Example: a suitable operator accepts. Four steps explain how the arrangement becomes a completed service.", "مثال: يوافق مشغّل مناسب. وتوضح أربع خطوات كيف يصبح الترتيب خدمة مكتملة."]
    ,["Example: no suitable operator is available. The ride stays unconfirmed; alternatives or a clear decline are needed.", "مثال: لا يتوفر مشغّل مناسب. تبقى الرحلة غير مؤكدة؛ ويلزم اقتراح بدائل أو الاعتذار بوضوح."]
    ,["from request to", "من الطلب وحتى"]
    ,["A proposed booking and trip-coordination service.", "خدمة مقترحة لحجز الرحلات وتنسيقها."]
    ,["enhanced transportation administrators", "منظّمو خدمات النقل المحسّنة"]
    ,["estimated time of arrival", "الوقت المقدّر للوصول"]
    ,["Cancel sample plan", "ألغِ الخطة التجريبية"]
    ,["Example operator", "مشغّل افتراضي"]
    ,["Keep request open / ask for help", "اترك الطلب مفتوحاً / اطلب المساعدة"]
    ,["Plan rides during a stay", "رتّب تنقّلات خلال الإقامة"]
    ,["Try a sample ride", "جرّب رحلة تجريبية"]
    ,["ETA preview", "معاينة ETA"]
    ,["Keep the plan", "أبقِ على الخطة"]
    ,["Your trips", "رحلاتك"]
    ,["You", "أنت"]
    ,[" trip ", " رحلة "]
    ,[" trips ", " رحلات "]
    ,[" guests ", " ركّاب "]
    ,[" Starts ", " تبدأ "]
    ,[" completed", " مكتملة"]
    ,["2-hour reserved-driver window requested", "فترة حجز سائق مطلوبة لمدة ساعتين"]
    ,["3-hour reserved-driver window requested", "فترة حجز سائق مطلوبة لمدة 3 ساعات"]
    ,["4-hour reserved-driver window requested", "فترة حجز سائق مطلوبة لمدة 4 ساعات"]
    ,["8-hour reserved-driver window requested", "فترة حجز سائق مطلوبة لمدة 8 ساعات"]
    ,[" (simulated).", " (محاكاة)."]
    ,["This is not a real service event.", "هذا ليس حدثاً ضمن خدمة فعلية."]
    ,["preferred.", "السائق المفضّل."]
    ,["unavailable.", "غير متاح."]
    ,["capacity.", "السعة."]
    ,["driver.", "السائق."]
    ,["stale.", "غير محدّث."]
    ,["conflict.", "التعارض."]
    ,["arrival.", "الوصول."]
    ,["Our best work starts", "أفضل ما نقدّمه يبدأ"]
    ,["with understanding yours.", "بفهم عملك."]
    ,["Taxi operators asked, we listened.", "طلب مشغّلو سيارات الأجرة أن نُصغي، فاستمعنا."]
    ,["Research, not a promise of bookings or earnings.", "بحث، وليس وعداً بحجوزات أو دخل."]
    ,["Your answers are still here.", "ما زالت إجاباتك محفوظة هنا."]
    ,["Every answer is optional.", "كل إجابة اختيارية."]
    ,["Interactive guest example", "مثال تفاعلي لتجربة الضيوف"]
    ,["Learn more", "اعرف المزيد"]
    ,["Not answered", "لم تتم الإجابة"]
    ,["Enter an amount (an estimate is fine)", "أدخل مبلغاً (يمكن أن يكون تقديرياً)"]
    ,["Enter a count (an estimate is fine)", "أدخل عدداً (يمكن أن يكون تقديرياً)"]
    ,["Number of completed bookings", "عدد الحجوزات المنجزة"]
    ,["Amount in US dollars", "المبلغ بالدولار الأمريكي"]
    ,["Earlier draft status could not be checked. Any older questionnaire drafts have not been changed.", "تعذّر التحقق من حالة المسودة السابقة. لم تتغير أي مسودات قديمة للاستبيان."]
    ,["An earlier-version draft or pending response remains stored in this browser. It has not been imported or deleted. If it was awaiting confirmation, resolve that earlier response before sending a new one.", "ما زالت هناك مسودة أو إجابة معلّقة من إصدار سابق في هذا المتصفح. لم يتم استيرادها أو حذفها. إذا كانت بانتظار التأكيد، فاحسم أمرها قبل إرسال إجابة جديدة."]
    ,["Please keep this answer within ", "يرجى ألا يتجاوز طول هذه الإجابة "]
    ,[" characters.", " حرفاً."]
    ,["Choose up to ", "اختر حتى "]
    ,[" answers for this question.", " إجابات لهذا السؤال."]
    ,["Not applicable based on your earlier answer.", "لا ينطبق بناءً على إجابتك السابقة."]
    ,["How many working vehicles do these answers cover?", "كم مركبة عاملة تشملها هذه الإجابات؟"]
    ,["The questions could not load. No answers have been sent. Reload this page when connected. A saved HTML file needs the website and its question files to work.", "تعذّر تحميل الأسئلة ولم تُرسل أي إجابات. أعد تحميل الصفحة عند الاتصال. يحتاج ملف HTML المحفوظ إلى الموقع وملفات الأسئلة ليعمل."]
    ,["No booking, payment or subscription is created.", "لن يُنشأ حجز أو دفعة أو اشتراك."]
    ,["Traveling", "السفر"]
    ,["Not answered", "لم تتم الإجابة"]
    ,["Maya R.", "مايا ر."]
    ,["Samir A.", "سمير أ."]
    ,["Use a sample reference", "استخدم مرجعاً تجريبياً"]
    ,["Arrival", "الوصول"]
    ,["Dinner return", "العودة من العشاء"]
    ,["Dinner", "العشاء"]
    ,["Departure", "المغادرة"]
    ,["Guest group A", "مجموعة الضيوف أ"]
    ,["Wedding party", "مجموعة العرس"]
    ,["Guest return", "عودة الضيوف"]
    ,["Private island tour", "جولة خاصة في الجزيرة"]
    ,["Airport arrival", "الوصول إلى المطار"]
    ,["Cyril E. King Airport", "مطار سيريل إي. كينغ"]
    ,["Sample villa, East End", "مكان إقامة تجريبي، الطرف الشرقي"]
    ,["Sample hotel, Charlotte Amalie", "فندق افتراضي، شارلوت أمالي"]
    ,["Example wedding venue, East End", "موقع عرس افتراضي، الطرف الشرقي"]
    ,["Mountain Top / Magens Bay / Red Hook", "ماونتن توب / خليج ماغنز / رد هوك"]
    ,["Sapphire Beach / Smith Bay / Red Hook", "شاطئ سافاير / خليج سميث / رد هوك"]
    ,["U.S. Virgin Islands", "جزر العذراء الأمريكية"]
    ,["A proposed booking", "حجز مقترح"]
    ,["and trip-coordination service.", "وتنسيق للرحلات."]
    ,["from request to", "من الطلب وحتى"]
    ,["Illustrative itinerary", "خطة رحلة توضيحية"]
    ,["STT", "المطار"]
    ,["01 / ST. THOMAS", "01 / سانت توماس"]
    ,["A useful service starts with your working reality.", "الخدمة المفيدة تبدأ بفهم واقع عملك."]
  ];

  const sortedPhrases = phrases.sort((a, b) => b[0].length - a[0].length);

  function localize(value) {
    let result = value;
    const trimmed = value.trim();
    const exact = phrases.find(([source]) => source === trimmed);
    if (exact) {
      const start = value.indexOf(trimmed);
      return value.slice(0, start) + exact[1] + value.slice(start + trimmed.length);
    }
    for (const [source, target] of sortedPhrases) {
      if (/^[A-Za-z0-9]+$/.test(source)) continue;
      result = result.split(source).join(target);
    }
    return result;
  }

  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const translated = localize(node.nodeValue);
      if (translated !== node.nodeValue) node.nodeValue = translated;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    for (const name of ["aria-label", "aria-description", "title", "placeholder"]) {
      const value = node.getAttribute(name);
      if (value) {
        const translated = localize(value);
        if (translated !== value) node.setAttribute(name, translated);
      }
    }
    for (const child of node.childNodes) translateNode(child);
  }

  function start() {
    translateNode(document.body);
    new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "characterData") translateNode(record.target);
        else for (const node of record.addedNodes) translateNode(node);
      }
    }).observe(document.body, { childList: true, characterData: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
