/**
 * Room catalogue — client-safe configuration only.
 *
 * This file is imported by React components AND by the server-side calendar
 * sync. It deliberately contains no node-specific imports so it can be bundled
 * for the browser.
 *
 * `bookingMode` drives the cell status when there is no external booking:
 *   'online'  → 可訂房, shows the nightly rate and is clickable
 *   'call'    → 請電話訂房, shows `phone`
 *   'closed'  → 未開放
 *
 * External .ics bookings always win and force the cell into 已客滿.
 */

export const HOTEL = {
  name: '天台邑旅店',
  enName: 'TIANTAIYI HOTEL',
  phone: '0912-345-678',
  phoneHref: 'tel:+886912345678',
  lineUrl: 'https://line.me/',
  checkIn: '15:00',
  checkOut: '11:00',
};

/** How long a room/date is held in the reservation cart before it expires. */
export const HOLD_SECONDS = 5 * 60;

export const ROOM_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  CALL: 'call',
  CLOSED: 'closed',
};

export const ROOMS = [
  {
    id: 'double',
    name: '雙人房',
    enName: 'Double Room',
    capacity: 2,
    totalUnits: 3,
    price: 2000,
    bookingMode: 'online',
    image: '/media/p1.jpeg',
    description: '一大床房型，適合情侶、好友雙人同行，附獨立衛浴與空調。',
  },
  {
    id: 'quad',
    name: '四人房',
    enName: 'Quad Room',
    capacity: 4,
    totalUnits: 2,
    price: 3600,
    bookingMode: 'online',
    image: '/media/p3.jpeg',
    description: '兩大床房型，適合家庭或四人好友出遊，空間明亮通風。',
  },
  {
    id: 'family',
    name: '家庭房',
    enName: 'Family Room',
    capacity: 6,
    totalUnits: 1,
    price: 4800,
    bookingMode: 'call',
    phone: HOTEL.phone,
    phoneHref: HOTEL.phoneHref,
    image: '/media/p4.jpeg',
    description: '六人家庭房，需來電確認加床與入住安排。',
  },
  {
    id: 'whole',
    name: '包棟',
    enName: 'Whole Building',
    capacity: 16,
    totalUnits: 1,
    price: 15800,
    bookingMode: 'closed',
    image: '/media/61297c99-145c-4d42-a07c-b133ad182a95.jpeg',
    description: '整棟包棟方案，適合團體與家族旅遊，開放時間另行公告。',
  },
];

export function getRoomById(id) {
  return ROOMS.find((r) => r.id === id) || null;
}

/** Human-readable label + styling key for each cell status. */
export const STATUS_META = {
  [ROOM_STATUS.AVAILABLE]: { label: '可訂房', tone: 'available' },
  [ROOM_STATUS.BOOKED]: { label: '已客滿', tone: 'booked' },
  [ROOM_STATUS.CALL]: { label: '請電話訂房', tone: 'call' },
  [ROOM_STATUS.CLOSED]: { label: '未開放', tone: 'closed' },
};