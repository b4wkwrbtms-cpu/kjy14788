// 꺼내기용: 게스트 메모리 할당을 밖에서 쓰게
#include "base.h"
EXPORT(guest_malloc) u32 guest_malloc(u32 n) { return gmalloc(n); }
