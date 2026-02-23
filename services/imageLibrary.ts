/**
 * VISINARO IMAGE LIBRARY
 * Curated Unsplash photo IDs mapped to topics.
 * These are stable permanent URLs - images.unsplash.com never breaks.
 * Format: https://images.unsplash.com/PHOTO_ID?w=W&h=H&fit=crop&auto=format&q=80
 */

export const PHOTOS: Record<string, string[]> = {
  coffee: [
    'photo-1495474472287-4d71bcdd2085','photo-1509042239860-f550ce710b93',
    'photo-1514432324607-a09d9b4aefdd','photo-1442512595331-e89e73853f31',
    'photo-1447933601403-0c6688de566e','photo-1520970014086-2208d157e9d6',
    'photo-1485808191679-5f86510bd9d2','photo-1554118811-1e0d58224f24',
    'photo-1501747315-124a0eaca060',  'photo-1459755486867-b55449bb39ff',
  ],
  restaurant: [
    'photo-1414235077428-338989a2e8c0','photo-1517248135467-4c7edcad34c4',
    'photo-1424847651672-bf20a4b0982b','photo-1540189549336-e6e99c3679fe',
    'photo-1476224203421-9ac39bcb3327','photo-1467003909585-2f8a72700288',
    'photo-1504674900247-0877df9cc836','photo-1565299624946-b28f40a0ae38',
    'photo-1512621776951-a57141f2eefd','photo-1555396273-367ea4eb4db5',
  ],
  gym: [
    'photo-1534438327276-14e5300c3a48','photo-1571019613454-1cb2f99b2d8b',
    'photo-1517836357463-d25dfeac3438','photo-1581009137042-c552e485697a',
    'photo-1583454110551-21f2fa2afe61','photo-1549060279-7e168fcee0c2',
    'photo-1518611012118-696072aa579a','photo-1526506118085-60ce8714f8c5',
    'photo-1574680096145-d05b474e2155','photo-1540497077202-7c8a3999166f',
  ],
  tech: [
    'photo-1531297484001-80022131f5a1','photo-1461749280684-dccba630e2f6',
    'photo-1504384308090-c894fdcc538d','photo-1518770660439-4636190af475',
    'photo-1573164713988-8665fc963095','photo-1498050108023-c5249f4df085',
    'photo-1555066931-4365d14bab8c','photo-1563986768494-4dee2763ff3f',
    'photo-1519389950473-47ba0277781c','photo-1522202176988-66273c2fd55f',
  ],
  fashion: [
    'photo-1445205170230-053b83016050','photo-1483985988355-763728e1935b',
    'photo-1558618666-fcd25c85cd64','photo-1469334031218-e382a71b716b',
    'photo-1515886657613-9f3515b0c78f','photo-1509631179647-0177331693ae',
    'photo-1490481651871-ab68de25d43d','photo-1525507119028-ed4c629a60a3',
    'photo-1496747611176-843222e1e57c','photo-1536766820879-059fec98ec0a',
  ],
  law: [
    'photo-1589829545856-d10d557cf95f','photo-1450101499163-c8848c66ca85',
    'photo-1479142506502-19b3a3b7ff33','photo-1521791136064-7986c2920216',
    'photo-1507679799987-c73779587ccf','photo-1542744094-3a31f272c490',
    'photo-1628348068343-c6a848d2b6dd','photo-1453728013993-6d66e9c9123a',
  ],
  hotel: [
    'photo-1566073771259-6a8506099945','photo-1582719508461-905c673771fd',
    'photo-1445019980597-93fa8acb246c','photo-1571003123894-1f0594d2b5d9',
    'photo-1520250497591-112f2f40a3f4','photo-1542314831-068cd1dbfeeb',
    'photo-1455587734955-081b22074882','photo-1551882547-ff40c63fe2fa',
  ],
  portrait: [
    'photo-1507003211169-0a1dd7228f2d','photo-1494790108377-be9c29b29330',
    'photo-1438761681033-6461ffad8d80','photo-1472099645785-5658abf4ff4e',
    'photo-1500648767791-00dcc994a43e','photo-1534528741775-53994a69daeb',
    'photo-1573497019940-1c28c88b4f3e','photo-1564564321837-a57b7070ac4f',
    'photo-1573496359142-b8d87734a5a2','photo-1580489944761-15a19d654956',
  ],
  office: [
    'photo-1497366216548-37526070297c','photo-1497366754035-f200968a6e72',
    'photo-1568992687947-868a62a9f521','photo-1516321318423-f06f85e504b3',
    'photo-1542744173-8e7e53415bb0','photo-1521737604893-d14cc237f11d',
    'photo-1553877522-43269d4ea984','photo-1497215842964-222b430dc094',
  ],
  nature: [
    'photo-1501854140801-50d01698950b','photo-1441974231531-c6227db76b6e',
    'photo-1518495973542-4542c06a5843','photo-1469474968028-56623f02e42e',
    'photo-1426604966848-d7adac402bff','photo-1472214103451-9374bd1c798e',
  ],
  medical: [
    'photo-1551190822-a9333d879b1f','photo-1576091160550-2173dba999ef',
    'photo-1559757148-5c350d0d3c56','photo-1584982751601-97dcc096659c',
    'photo-1530497610245-94d3c16cda28','photo-1579684385127-1ef15d508118',
  ],
};

/** Detect which topic a website is about from its HTML content */
export function detectTopic(html: string): string {
  const text = html.toLowerCase();
  if (/coffee|cafe|brew|espresso|latte|cappuccino|barista/.test(text)) return 'coffee';
  if (/restaurant|bistro|dine|dining|cuisine|menu|chef|food/.test(text)) return 'restaurant';
  if (/gym|fitness|workout|exercise|muscle|crossfit|training|sport/.test(text)) return 'gym';
  if (/fashion|style|clothing|boutique|apparel|wear|outfit/.test(text)) return 'fashion';
  if (/law|legal|attorney|lawyer|court|counsel|litigation/.test(text)) return 'law';
  if (/hotel|resort|hospitality|accommodation|lodging|suite/.test(text)) return 'hotel';
  if (/medical|health|clinic|doctor|hospital|wellness|therapy/.test(text)) return 'medical';
  if (/saas|software|tech|app|startup|digital|cloud|platform|ai/.test(text)) return 'tech';
  return 'office'; // default
}

/** Get a specific photo URL by topic and index */
export function getPhoto(topic: string, index: number, width = 800, height = 500): string {
  const pool = PHOTOS[topic] || PHOTOS['office'];
  const id = pool[index % pool.length];
  return `https://images.unsplash.com/${id}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
}

/** Get multiple photos for a topic */
export function getPhotos(topic: string, count: number, width = 800, height = 500): string[] {
  return Array.from({length: count}, (_, i) => getPhoto(topic, i, width, height));
}
