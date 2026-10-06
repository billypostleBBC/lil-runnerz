"""Original 64 by 80 pixel frames; Python 3, no dependencies.

Drawn on the finer grid, not a scaled copy of the 32 by 40 artwork.
The game displays each frame at half scale to preserve its world size.
"""
from pathlib import Path
import struct
import zlib

FRAME_W, H = 64, 80
W = FRAME_W * 14
pixels = bytearray(W * H * 4)


def rect(frame, x, y, w, h, colour):
    colour = bytes.fromhex(colour) + b'\xff'
    for py in range(max(0, y), min(y + h, H)):
        for px in range(max(0, x), min(x + w, FRAME_W)):
            i = (py * W + frame * FRAME_W + px) * 4
            pixels[i:i + 4] = colour


for frame in range(14):
    def r(x, y, w, h, colour):
        # Breathing lowers the upper body only; the soles stay planted.
        bob = {8: 1, 13: 2, 12: 3}.get(frame, 0) if y < 58 else 0
        rect(frame, x, y + bob, w, h, colour)

    # Swept hair: stepped silhouette, with individual one-pixel highlights.
    r(24, 4, 19, 2, '252331')
    r(20, 6, 27, 3, '252331')
    r(18, 9, 31, 11, '252331')
    r(20, 9, 27, 8, '673d32')
    r(23, 7, 19, 3, '82513b')
    r(23, 9, 20, 2, 'a06643')
    r(21, 12, 17, 1, 'be8352')
    r(20, 16, 7, 10, '673d32')
    r(22, 18, 4, 7, '82513b')
    r(43, 11, 5, 7, '673d32')

    # Smaller face, profile nose, ear, eyebrow and single-pixel eye glint.
    r(25, 17, 23, 16, '252331')
    r(27, 16, 17, 5, 'efbd93')
    r(26, 21, 21, 9, 'eab086')
    r(28, 30, 16, 3, 'd59070')
    r(46, 23, 2, 3, 'eab086')
    r(47, 24, 1, 1, 'f5caa1')
    r(41, 19, 5, 1, '673d32')
    r(43, 21, 2, 3, '252331')
    r(43, 21, 1, 1, 'fff1d1')
    r(25, 23, 4, 5, 'd59070')
    r(26, 23, 2, 3, 'efbd93')
    r(42, 29, 5, 1, '8a4b41')
    r(31, 33, 10, 4, 'd59070')

    # Slimmer red quilted gilet over a denim jacket and cream shirt.
    r(23, 36, 23, 22, '252331')

    r(25, 36, 9, 20, 'e36549')
    r(36, 36, 9, 20, 'c14f40')
    r(26, 37, 2, 17, 'f08459')
    r(34, 37, 3, 19, 'f6dfb0')
    r(33, 40, 1, 15, '8a443a')
    r(37, 39, 1, 16, 'ff9765')
    r(28, 36, 5, 4, '88a4ae')
    r(38, 36, 4, 4, '638b9f')
    for y in (43, 49, 54):
        r(27, y, 6, 1, 'b64c40')
        r(39, y, 5, 1, '963f39')
    r(28, 48, 3, 1, 'ffb17a')
    r(39, 48, 3, 1, 'ef986d')

    r(24, 56, 21, 2, '38333e')
    r(34, 56, 3, 2, 'bb9470')

    def limb(start, end, width, colour):
        dx, dy = end[0] - start[0], end[1] - start[1]
        steps = max(abs(dx), abs(dy), 1)
        for step in range(steps + 1):
            r(round(start[0] + dx * step / steps),
              round(start[1] + dy * step / steps), width, width, colour)

    # Opposing shoulder/elbow/wrist poses make the arms pump during running.
    arms = {
        1: ((16, 44), (12, 39), (47, 45), (50, 52)),
        2: ((20, 46), (23, 51), (45, 45), (49, 42)),
        3: ((22, 44), (28, 39), (47, 43), (52, 38)),
        9: ((18, 44), (14, 49), (43, 46), (39, 51)),
        4: ((17, 34), (20, 27), (48, 34), (51, 27)),
        10: ((16, 38), (12, 33), (49, 38), (53, 33)),
        11: ((16, 43), (11, 40), (50, 43), (55, 40)),
        12: ((18, 44), (16, 49), (48, 44), (51, 49)),
        5: ((17, 42), (12, 40), (49, 40), (53, 37)),
        7: ((19, 43), (18, 48), (46, 31), (46, 26)),
    }
    left_elbow, left_hand, right_elbow, right_hand = arms.get(
        frame, ((20, 45), (21, 52), (45, 45), (45, 52)))
    for shoulder, elbow, hand in (
            ((21, 38), left_elbow, left_hand),
            ((44, 38), right_elbow, right_hand)):
        limb(shoulder, elbow, 5, '42657e')
        limb(elbow, hand, 4, '739aad')
        r(hand[0], hand[1], 4, 4, 'eab086')

    def shoe(x, y):
        # Air MAG-inspired high collar, ankle strap and luminous cyan sole.
        r(x, y, 8, 8, '535f69')
        r(x + 1, y, 6, 2, 'b9c4c6')
        r(x + 1, y + 2, 6, 5, '89989e')
        r(x, y + 3, 8, 2, 'e4e9df')
        r(x + 2, y + 6, 10, 3, '89989e')
        r(x + 8, y + 7, 5, 2, 'aab5b7')
        r(x + 3, y + 6, 2, 1, 'e4e9df')
        r(x + 5, y + 5, 2, 1, 'e4e9df')
        r(x, y + 9, 13, 2, '586875')
        r(x + 1, y + 9, 11, 1, 'a9bbb8')
        r(x + 1, y + 10, 4, 1, '6af1e2')
        r(x + 8, y + 10, 4, 1, '6af1e2')
        r(x, y + 7, 1, 1, 'e7cd65')

    # Knees travel independently of the feet, including a visible airborne tuck.
    legs = {
        1: ((21, 62), (18, 66), (40, 61), (43, 63)),
        2: ((26, 62), (28, 66), (36, 61), (34, 66)),
        3: ((30, 61), (36, 63), (34, 62), (28, 66)),
        9: ((25, 61), (22, 66), (39, 62), (39, 66)),
        4: ((20, 61), (19, 64), (43, 55), (45, 58)),
        10: ((19, 56), (17, 59), (43, 54), (45, 57)),
        11: ((23, 61), (21, 64), (40, 60), (42, 63)),
        12: ((21, 63), (23, 66), (41, 63), (39, 66)),
        5: ((23, 61), (23, 64), (40, 61), (39, 64)),
    }
    knee_l, foot_l, knee_r, foot_r = legs.get(
        frame, ((25, 62), (25, 66), (37, 62), (37, 66)))
    r(25, 58, 18, 4, '324963')
    for hip, knee, foot in (((26, 58), knee_l, foot_l), ((37, 58), knee_r, foot_r)):
        limb(hip, knee, 6, '324963')
        limb(knee, foot, 5, '517a91')
        r(knee[0] + 1, knee[1], 3, 1, '7898a5')
        shoe(*foot)

    if frame == 5:
        # Thin pink deck, graphic stripes and two cyan hover pads.
        r(5, 75, 53, 3, '252331')
        r(8, 74, 47, 3, 'ef6bac')
        r(5, 74, 5, 2, 'ef6bac')
        r(54, 73, 5, 2, 'ef6bac')
        r(10, 74, 14, 1, 'ffdeb9')
        r(35, 75, 12, 1, '89cf81')
        r(15, 78, 10, 1, '70cdc7')
        r(43, 78, 9, 1, '70cdc7')
    if frame == 6:
        r(41, 21, 5, 3, 'eab086')
        r(41, 22, 5, 1, '252331')



def chunk(kind, data):
    return (struct.pack('>I', len(data)) + kind + data
            + struct.pack('>I', zlib.crc32(kind + data)))


raw = b''.join(b'\0' + pixels[y * W * 4:(y + 1) * W * 4] for y in range(H))
png = (b'\x89PNG\r\n\x1a\n'
       + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 6, 0, 0, 0))
       + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b''))
Path('public/assets/marty.png').write_bytes(png)
