import { t } from "elysia";

export const CommonParams = {
  id: t.Object({ id: t.String() }),
  idMid: t.Object({ id: t.String(), mid: t.String() }),
  idCid: t.Object({ id: t.String(), cid: t.String() }),
  idPid: t.Object({ id: t.String(), pid: t.String() }),
  idAid: t.Object({ id: t.String(), aid: t.String() }),
  idVid: t.Object({ id: t.String(), vid: t.String() }),
  idContactId: t.Object({ id: t.String(), contactId: t.String() }),
  idRecipientId: t.Object({ id: t.String(), recipientId: t.String() }),
  idItemId: t.Object({ id: t.String(), itemId: t.String() }),
  idPhotoId: t.Object({ id: t.String(), photoId: t.String() }),
  idAttendeeId: t.Object({ id: t.String(), attendeeId: t.String() }),
  idMemberAttendeeId: t.Object({ id: t.String(), memberAttendeeId: t.String() }),
  idAssetId: t.Object({ id: t.String(), assetId: t.String() }),
  idScheduleId: t.Object({ id: t.String(), scheduleId: t.String() }),
  idMidMemberId: t.Object({ id: t.String(), mid: t.String(), memberId: t.String() }),
  idAidMemberId: t.Object({ id: t.String(), aid: t.String(), memberId: t.String() }),
  idOid: t.Object({ id: t.String(), oid: t.String() }),
};
