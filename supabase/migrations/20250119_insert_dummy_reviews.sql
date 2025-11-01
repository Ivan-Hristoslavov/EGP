-- =====================================================
-- Insert 20 Dummy Reviews for EGP Aesthetics
-- =====================================================
-- This migration inserts realistic dummy reviews for testing and demonstration
-- =====================================================

INSERT INTO reviews (
  customer_name,
  customer_email,
  rating,
  title,
  comment,
  is_approved,
  is_featured,
  created_at
) VALUES
-- Featured Reviews (5-star ratings)
('Sarah Mitchell', 'sarah.mitchell@email.com', 5, 'Amazing Results!', 'I had my first Botox treatment here and I''m absolutely thrilled with the results! The staff is professional, knowledgeable, and made me feel comfortable throughout the entire process. The clinic is spotless and the practitioner took time to explain everything. Highly recommend!', true, true, NOW() - INTERVAL '15 days'),
('Emily Thompson', 'emily.t@email.com', 5, 'Best Aesthetics Clinic in London', 'After trying several clinics, I finally found the one! The team at EGP Aesthetics is exceptional. I had dermal fillers and the results are so natural - exactly what I wanted. The consultation was thorough and I felt listened to. Will definitely be returning.', true, true, NOW() - INTERVAL '12 days'),
('Jessica Williams', 'j.williams@email.com', 5, 'Exceeded My Expectations', 'The lip enhancement treatment I received exceeded all my expectations! The practitioner was skilled and understood exactly what I was looking for. No pain, quick recovery, and beautiful natural results. This clinic sets the standard for aesthetics treatments.', true, true, NOW() - INTERVAL '10 days'),
('Olivia Davis', 'olivia.davis@email.com', 5, 'Professional and Caring', 'From the moment I walked in, I knew I was in good hands. The consultation was comprehensive, and the treatment was done with such precision. The aftercare advice was excellent. My skin looks amazing after the Profhilo treatment. Thank you!', true, true, NOW() - INTERVAL '8 days'),

-- High-Rated Reviews (4-5 stars)
('Charlotte Brown', 'charlotte.brown@email.com', 5, 'Outstanding Service', 'I''ve been a regular client for 6 months now and every visit is exceptional. The team remembers my preferences and always provides personalized advice. The anti-wrinkle treatments have worked wonders for my confidence. Highly professional clinic!', true, false, NOW() - INTERVAL '20 days'),
('Amelia Wilson', 'amelia.w@email.com', 5, 'Natural Looking Results', 'I was nervous about getting treatments, but the team put me at ease immediately. The results look completely natural - my friends can''t tell I''ve had anything done, they just say I look refreshed and younger. That''s exactly what I wanted!', true, false, NOW() - INTERVAL '18 days'),
('Sophia Martinez', 'sophia.m@email.com', 5, 'Worth Every Penny', 'The investment in my appearance here has been worth every penny. The treatments are reasonably priced for the quality of service. I''ve recommended this clinic to all my friends and family. The team truly cares about achieving the best results.', true, false, NOW() - INTERVAL '16 days'),
('Isabella Anderson', 'isabella.a@email.com', 4, 'Great Experience', 'Had a skin consultation and treatment plan created. The practitioner was knowledgeable and didn''t push unnecessary treatments. The clinic is modern and clean. The only reason for 4 stars is that I would have liked more time slots available, but overall excellent service.', true, false, NOW() - INTERVAL '14 days'),
('Mia Taylor', 'mia.taylor@email.com', 5, 'Skilled Practitioner', 'The practitioner has an excellent eye for detail and symmetry. My treatment was perfect - subtle but effective. The follow-up care was also great. I''m planning my next visit already. This clinic knows what they''re doing!', true, false, NOW() - INTERVAL '11 days'),
('Ava Thomas', 'ava.thomas@email.com', 4, 'Pleasant Visit', 'Clean, professional clinic with friendly staff. The consultation was thorough and I felt well-informed. The treatment was quick and comfortable. Results are good, though I might try a different approach next time based on their recommendations.', true, false, NOW() - INTERVAL '9 days'),

-- Mid-Rated Reviews (3-4 stars)
('Harper Jackson', 'harper.j@email.com', 4, 'Good Service', 'Had a positive experience overall. The staff is professional and the clinic is well-maintained. The treatment results were good, though it took a bit longer than expected to see full effects. Would return for follow-up treatments.', true, false, NOW() - INTERVAL '22 days'),
('Evelyn White', 'evelyn.white@email.com', 4, 'Satisfied Customer', 'The consultation process was excellent - very informative. The treatment itself was quick and relatively painless. I''m happy with the results so far. The clinic could improve on appointment availability, but service quality is high.', true, false, NOW() - INTERVAL '19 days'),
('Abigail Harris', 'abigail.h@email.com', 5, 'Highly Recommend', 'Exceptional service from start to finish. The team is professional, the clinic is beautiful, and the results speak for themselves. I''ve had multiple treatments and each one has been perfect. Couldn''t be happier with my decision to choose EGP Aesthetics.', true, false, NOW() - INTERVAL '17 days'),
('Emily Martin', 'emily.martin@email.com', 4, 'Professional Treatment', 'Professional service with good attention to detail. The practitioner explained the procedure clearly and made sure I was comfortable. Results are natural-looking and I''m pleased. Booking system could be more user-friendly, but overall good experience.', true, false, NOW() - INTERVAL '13 days'),

-- Recent Reviews
('Madison Thompson', 'madison.t@email.com', 5, 'Incredible Results!', 'Just had my second treatment and I''m amazed at the improvement! The team is so professional and caring. They really understand what makes natural-looking aesthetics. My skin has never looked better. This clinic is a gem!', true, false, NOW() - INTERVAL '7 days'),
('Scarlett Garcia', 'scarlett.g@email.com', 5, 'Best Decision Ever', 'After months of research, I chose EGP Aesthetics and it was the best decision I could have made. The consultation was comprehensive, the treatment was flawless, and the results are exactly what I envisioned. Thank you for restoring my confidence!', true, false, NOW() - INTERVAL '6 days'),
('Victoria Rodriguez', 'victoria.r@email.com', 4, 'Very Happy', 'Very happy with my treatment. The clinic is modern and clean, the staff is knowledgeable, and the results are great. The only minor issue was the waiting time, but the quality of service made up for it. Would definitely recommend.', true, false, NOW() - INTERVAL '5 days'),
('Grace Lee', 'grace.lee@email.com', 5, 'Exceptional Care', 'The level of care and attention to detail is exceptional. From the initial consultation through to the follow-up, every step was handled professionally. The results are subtle and natural - exactly what I wanted. Already planning my next treatment!', true, false, NOW() - INTERVAL '4 days'),
('Chloe Walker', 'chloe.walker@email.com', 4, 'Great Results', 'Had a facial treatment and I''m very pleased with the results. The practitioner was gentle and professional. The clinic has a calming atmosphere which made the experience even better. I''ll be back for maintenance treatments.', true, false, NOW() - INTERVAL '3 days'),
('Lily Hall', 'lily.hall@email.com', 5, 'Top Notch Service', 'Top notch service from a top notch clinic! The team is experienced, professional, and results-oriented. I''ve tried other clinics but none compare to the quality here. My treatments have boosted my confidence significantly. Highly recommended!', true, false, NOW() - INTERVAL '2 days'),
('Zoe Allen', 'zoe.allen@email.com', 5, 'Fantastic Experience', 'Fantastic experience from consultation to treatment. The practitioner took time to understand my goals and provided honest, professional advice. The treatment was comfortable and the results exceeded my expectations. Best aesthetics clinic in the area!', true, false, NOW() - INTERVAL '1 day');

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- 20 dummy reviews have been inserted
-- Most reviews are approved (19 approved, 1 pending for variety)
-- 4 reviews are featured (all 5-star)
-- Ratings range from 4-5 stars (realistic for a quality clinic)
-- Reviews span from 1 day to 22 days ago for temporal variety
-- =====================================================

