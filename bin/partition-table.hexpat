import std.io;
import std.mem;

struct Partition {
    u8 type;
    u8 subtype;
    u32 offset;
    u32 size;
    char name[20];
};

struct Checksum {
    u8 pad[14];
    u128 sum;
};

struct Empty {
    u8 e[30];
};

struct Undefined {
    u8 undef[30];
};

struct Element {
    u16 kind;
    if (this.kind == 0x50AA) {
        Partition p;
    } else
    if (this.kind == 0xEBEB) {
        Checksum sum;
    } else
    if (this.kind == 0xFFFF) {
        Empty empty;
    } else {
        Undefined undef;
    }
};

struct Document {
    Element el[while(!std::mem::eof())] [[inline]];
};

Document doc @ 0x00;
