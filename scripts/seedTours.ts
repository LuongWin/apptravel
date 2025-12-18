// Script để thêm dữ liệu tour mẫu vào Firebase
// Chạy script này trong React Native app để populate dữ liệu

import { db } from '@/services/firebaseConfig';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

const sampleTours = [
    {
        name: 'Khám phá Vịnh Hạ Long 3 ngày 2 đêm',
        description: 'Trải nghiệm du thuyền sang trọng, khám phá các hang động tuyệt đẹp và thưởng thức hải sản tươi ngon tại Vịnh Hạ Long - Di sản Thế giới được UNESCO công nhận.',
        price: 3500000,
        duration: 3,
        startDate: Timestamp.fromDate(new Date('2025-01-15')),
        endDate: Timestamp.fromDate(new Date('2025-01-17')),
        maxGuests: 30,
        currentGuests: 12,
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        location: 'Quảng Ninh',
        itinerary: [
            'Ngày 1: Khởi hành từ Hà Nội - Check-in du thuyền - Tham quan hang Sửng Sốt',
            'Ngày 2: Chèo kayak - Bơi lội - Tham quan làng chài - BBQ trên thuyền',
            'Ngày 3: Ngắm bình minh - Tham quan động Thiên Cung - Về Hà Nội'
        ],
        included: [
            'Xe đưa đón tận nơi',
            'Du thuyền 4 sao',
            'Ăn uống trọn gói',
            'Vé tham quan các hang động',
            'Hướng dẫn viên tiếng Việt',
            'Bảo hiểm du lịch'
        ],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        name: 'Du lịch Đà Lạt Mộng Mơ 4 ngày 3 đêm',
        description: 'Khám phá thành phố ngàn hoa với khí hậu mát mẻ quanh năm, tham quan các điểm đến nổi tiếng và thưởng thức đặc sản Đà Lạt.',
        price: 4200000,
        duration: 4,
        startDate: Timestamp.fromDate(new Date('2025-02-01')),
        endDate: Timestamp.fromDate(new Date('2025-02-04')),
        maxGuests: 25,
        currentGuests: 8,
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        location: 'Lâm Đồng',
        itinerary: [
            'Ngày 1: TP.HCM - Đà Lạt - Tham quan Thiền viện Trúc Lâm - Hồ Tuyền Lâm',
            'Ngày 2: Đồi chè Cầu Đất - Thác Datanla - Crazy House - Chợ đêm Đà Lạt',
            'Ngày 3: Langbiang - Thung lũng Tình Yêu - Nhà thờ Con Gà - Hồ Xuân Hương',
            'Ngày 4: Check-out - Mua sắm đặc sản - Bay về TP.HCM'
        ],
        included: [
            'Vé máy bay khứ hồi',
            'Khách sạn 3 sao trung tâm',
            'Ăn sáng tại khách sạn',
            'Xe du lịch đời mới',
            'Vé tham quan các điểm',
            'Bảo hiểm du lịch'
        ],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        name: 'Phú Quốc - Thiên đường biển đảo 5 ngày 4 đêm',
        description: 'Nghỉ dưỡng tại đảo ngọc Phú Quốc với bãi biển trong xanh, thưởng thức hải sản tươi sống và tham quan các điểm check-in hot nhất.',
        price: 6800000,
        duration: 5,
        startDate: Timestamp.fromDate(new Date('2025-02-15')),
        endDate: Timestamp.fromDate(new Date('2025-02-19')),
        maxGuests: 40,
        currentGuests: 25,
        image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
        location: 'Kiên Giang',
        itinerary: [
            'Ngày 1: Bay đến Phú Quốc - Check-in resort - Tự do nghỉ ngơi',
            'Ngày 2: Tour 4 đảo - Lặn ngắm san hô - Câu cá - BBQ trên đảo',
            'Ngày 3: Vinpearl Safari - VinWonders - Tắm biển',
            'Ngày 4: Bãi Sao - Sunset Sanato Beach Club - Chợ đêm Phú Quốc',
            'Ngày 5: Tham quan làng chài - Mua đặc sản - Bay về'
        ],
        included: [
            'Vé máy bay khứ hồi',
            'Resort 5 sao view biển',
            'Ăn sáng buffet quốc tế',
            'Xe đưa đón sân bay',
            'Tour 4 đảo trọn gói',
            'Vé Vinpearl Safari + VinWonders',
            'Bảo hiểm du lịch toàn diện'
        ],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        name: 'Sapa - Chinh phục đỉnh Fansipan 3 ngày 2 đêm',
        description: 'Khám phá vùng cao Tây Bắc với những thửa ruộng bậc thang tuyệt đẹp, chinh phục nóc nhà Đông Dương và trải nghiệm văn hóa dân tộc.',
        price: 3800000,
        duration: 3,
        startDate: Timestamp.fromDate(new Date('2025-03-01')),
        endDate: Timestamp.fromDate(new Date('2025-03-03')),
        maxGuests: 20,
        currentGuests: 15,
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        location: 'Lào Cai',
        itinerary: [
            'Ngày 1: Hà Nội - Sapa - Tham quan bản Cát Cát - Thác Tình Yêu',
            'Ngày 2: Chinh phục đỉnh Fansipan bằng cáp treo - Tham quan chùa Trình - Tản bộ thị trấn',
            'Ngày 3: Bản Tả Van - Ruộng bậc thang - Mua đặc sản - Về Hà Nội'
        ],
        included: [
            'Xe giường nằm đời mới',
            'Khách sạn 3 sao trung tâm',
            'Ăn theo chương trình',
            'Vé cáp treo Fansipan',
            'Bảo hiểm du lịch'
        ],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        name: 'Hội An - Đà Nẵng - Huế 4 ngày 3 đêm',
        description: 'Tour Miền Trung di sản với phố cổ Hội An, bãi biển Mỹ Khê, Bà Nà Hills và cố đô Huế mang đậm dấu ấn lịch sử.',
        price: 5200000,
        duration: 4,
        startDate: Timestamp.fromDate(new Date('2025-03-10')),
        endDate: Timestamp.fromDate(new Date('2025-03-13')),
        maxGuests: 35,
        currentGuests: 20,
        image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
        location: 'Quảng Nam - Đà Nẵng - Thừa Thiên Huế',
        itinerary: [
            'Ngày 1: Bay đến Đà Nẵng - Bà Nà Hills - Cầu Vàng - Check-in khách sạn',
            'Ngày 2: Ngũ Hành Sơn - Bãi biển Mỹ Khê - Phố cổ Hội An - Thả đèn lồng',
            'Ngày 3: Đà Nẵng - Huế - Đại Nội - Chùa Thiên Mụ - Thuyền rồng sông Hương',
            'Ngày 4: Lăng Khải Định - Mua đặc sản - Bay về'
        ],
        included: [
            'Vé máy bay khứ hồi',
            'Khách sạn 4 sao',
            'Ăn theo chương trình',
            'Vé cáp treo Bà Nà Hills',
            'Vé tham quan di tích',
            'Thuyền rồng sông Hương',
            'Bảo hiểm du lịch'
        ],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        name: 'Nha Trang - Vinpearl Land 4 ngày 3 đêm',
        description: 'Tận hưởng kỳ nghỉ tại thành phố biển Nha Trang với bãi tắm đẹp nhất Việt Nam, khám phá đảo Hòn Tre và vui chơi thỏa thích tại Vinpearl Land.',
        price: 5800000,
        duration: 4,
        startDate: Timestamp.fromDate(new Date('2025-03-20')),
        endDate: Timestamp.fromDate(new Date('2025-03-23')),
        maxGuests: 30,
        currentGuests: 18,
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        location: 'Khánh Hòa',
        itinerary: [
            'Ngày 1: Bay đến Nha Trang - Check-in khách sạn - Tự do tắm biển',
            'Ngày 2: Tour 4 đảo - Hòn Mun - Hòn Tằm - Bãi Tranh - Làng chài',
            'Ngày 3: Vinpearl Land - Công viên nước - Thủy cung - Cáp treo xuyên biển',
            'Ngày 4: Tháp Bà Ponagar - Chợ Đầm - Mua đặc sản - Bay về'
        ],
        included: [
            'Vé máy bay khứ hồi',
            'Khách sạn 4 sao gần biển',
            'Ăn sáng buffet',
            'Tour 4 đảo trọn gói',
            'Vé Vinpearl Land + Cáp treo',
            'Xe đưa đón',
            'Bảo hiểm du lịch'
        ],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        name: 'Đồng bằng Sông Cửu Long 3 ngày 2 đêm',
        description: 'Khám phá miền Tây sông nước với chợ nổi Cái Răng, vườn trái cây, làng nghề truyền thống và thưởng thức ẩm thực đặc sản Nam Bộ.',
        price: 2900000,
        duration: 3,
        startDate: Timestamp.fromDate(new Date('2025-04-01')),
        endDate: Timestamp.fromDate(new Date('2025-04-03')),
        maxGuests: 25,
        currentGuests: 10,
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        location: 'Cần Thơ - Vĩnh Long - Tiền Giang',
        itinerary: [
            'Ngày 1: TP.HCM - Mỹ Tho - Chùa Vĩnh Tràng - Chèo thuyền sông Tiền - Cồn Thới Sơn',
            'Ngày 2: Cần Thơ - Chợ nổi Cái Răng - Vườn cây trái - Làng nghề bánh tráng',
            'Ngày 3: Vĩnh Long - Cù lao An Bình - Mua đặc sản - Về TP.HCM'
        ],
        included: [
            'Xe du lịch đời mới',
            'Khách sạn 3 sao',
            'Ăn theo chương trình',
            'Thuyền chèo tay',
            'Vé tham quan',
            'Hoa quả theo mùa',
            'Bảo hiểm du lịch'
        ],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        name: 'Đảo Cát Bà - Vườn Quốc Gia 2 ngày 1 đêm',
        description: 'Khám phá hòn đảo hoang sơ với rừng nguyên sinh, bãi biển đẹp và đa dạng sinh học phong phú tại Vườn Quốc Gia Cát Bà.',
        price: 2500000,
        duration: 2,
        startDate: Timestamp.fromDate(new Date('2025-04-15')),
        endDate: Timestamp.fromDate(new Date('2025-04-16')),
        maxGuests: 20,
        currentGuests: 14,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        location: 'Hải Phòng',
        itinerary: [
            'Ngày 1: Hà Nội - Cát Bà - Vườn Quốc Gia - Trekking rừng - Bãi biển Cát Cò',
            'Ngày 2: Tour thăm Vịnh Lan Hạ - Chèo kayak - Bơi lội - Về Hà Nội'
        ],
        included: [
            'Xe đưa đón',
            'Phà đi đảo',
            'Khách sạn 2 sao',
            'Ăn theo chương trình',
            'Vé Vườn Quốc Gia',
            'Thuyền tham quan',
            'Bảo hiểm du lịch'
        ],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        name: 'Mù Cang Chải - Ruộng bậc thang vàng 3 ngày 2 đêm',
        description: 'Chiêm ngưỡng vẻ đẹp ngoạn mục của ruộng bậc thang vào mùa lúa chín vàng óng, khám phá văn hóa H\'Mông và thưởng thức món ăn dân tộc.',
        price: 3200000,
        duration: 3,
        startDate: Timestamp.fromDate(new Date('2025-09-15')),
        endDate: Timestamp.fromDate(new Date('2025-09-17')),
        maxGuests: 18,
        currentGuests: 0,
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        location: 'Yên Bái',
        itinerary: [
            'Ngày 1: Hà Nội - Nghĩa Lộ - Tham quan chè Suối Giàng - Mù Cang Chải',
            'Ngày 2: Khau Phạ - La Pán Tẩn - Chụp ảnh ruộng bậc thang - Sunset',
            'Ngày 3: Trekking bản làng - Chợ phiên - Mua đặc sản - Về Hà Nội'
        ],
        included: [
            'Xe 16 chỗ đời mới',
            'Homestay dân tộc',
            'Ăn đặc sản địa phương',
            'Hướng dẫn viên',
            'Phí tham quan',
            'Bảo hiểm du lịch'
        ],
        status: 'upcoming',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    },
    {
        name: 'Ninh Bình - Tràng An - Tam Cốc 2 ngày 1 đêm',
        description: 'Khám phá Vịnh Hạ Long trên cạn với phong cảnh núi non hùng vĩ, hang động kỳ thú và đền chùa linh thiêng tại kinh đô Hoa Lư.',
        price: 1800000,
        duration: 2,
        startDate: Timestamp.fromDate(new Date('2025-05-01')),
        endDate: Timestamp.fromDate(new Date('2025-05-02')),
        maxGuests: 30,
        currentGuests: 22,
        image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
        location: 'Ninh Bình',
        itinerary: [
            'Ngày 1: Hà Nội - Hoa Lư - Chùa Bái Đính - Tràng An - Hang Múa',
            'Ngày 2: Tam Cốc - Chèo thuyền trên sông - Bích Động - Về Hà Nội'
        ],
        included: [
            'Xe du lịch 45 chỗ',
            'Khách sạn 3 sao',
            'Ăn sáng + trưa',
            'Vé tham quan các điểm',
            'Thuyền tham quan Tràng An',
            'Xe đạp tại Tam Cốc',
            'Bảo hiểm du lịch'
        ],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    }
];

export async function seedTours() {
    try {
        const toursRef = collection(db, 'TOURS');

        for (const tour of sampleTours) {
            await addDoc(toursRef, tour);
            console.log(`✅ Added tour: ${tour.name}`);
        }

        console.log('✅ Successfully added all sample tours!');
        return { success: true, count: sampleTours.length };
    } catch (error) {
        console.error('❌ Error seeding tours:', error);
        throw error;
    }
}

// Export sample tours for reference
export { sampleTours };

