/**
 * Hesabım'ın sunucu tarafındaki oturum köprüsü (F2-45).
 *
 * Neden var: `/hesabim` altındaki her Server Component'in oturumu aynı şekilde
 * çözmesi ve aynı şekli üretmesi gerekiyor. Tek yerde toplanmazsa her sayfa
 * `session.user`'dan kendi alanlarını seçer ve istemci tarafındaki `useAuth()`
 * ile ufak farklar oluşur — bu da "isim bir an değişiyor" türü hatalara yol
 * açar.
 *
 * Bu dosya SUNUCU TARAFI. İstemci bileşenlerinden import edilmemeli.
 */

import { getAuthSession } from "@/lib/auth";
import type { UserType } from "./types";

/**
 * Oturumdaki kullanıcının istemciye geçirilebilir hâli.
 *
 * `useAuth()`'un ürettiği nesneyle aynı alanları taşır ki istemci oturumu
 * çözdüğünde görünen hiçbir şey değişmesin.
 */
export type ServerAccountUser = Pick<UserType, "id" | "name" | "email" | "image" | "phone">;

/**
 * Oturumdaki kullanıcıyı döndürür, oturum yoksa `null`.
 *
 * `getAuthSession()` çerez okuduğu için bunu çağıran her segment otomatik
 * olarak dinamik render'a geçer — `/hesabim` zaten kişiye özel olduğundan
 * istenen davranış bu.
 */
export async function getServerAccountUser(): Promise<ServerAccountUser | null> {
  const session = await getAuthSession();
  const user = session?.user;
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    phone: user.phone,
  };
}
