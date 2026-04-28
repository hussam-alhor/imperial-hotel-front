import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addRoomSchema, updateRoomSchema } from '../../schema/roomSchema.js';
import { useRooms, useAddRoom, useUpdateRoom, useDeleteRoom } from '../../hooks/useRooms.js';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { confirmDelete } from '../../lib/sweetalert.js';

const RoomsManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [editSelectedAmenities, setEditSelectedAmenities] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [editSelectedImages, setEditSelectedImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editSelectedFiles, setEditSelectedFiles] = useState([]);

  const { data: rooms, isLoading } = useRooms();
  const addRoomMutation = useAddRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    setValue: setValueAdd,
    formState: { errors: errorsAdd },
  } = useForm({
    resolver: zodResolver(addRoomSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(updateRoomSchema),
  });

  const amenitiesOptions = ['wiFi', 'breakFast', 'parking', 'pool', 'gym', 'spa'];

  const handleAmenityChange = (amenity, isEdit = false) => {
    if (isEdit) {
      setEditSelectedAmenities(prev =>
        prev.includes(amenity)
          ? prev.filter(a => a !== amenity)
          : [...prev, amenity]
      );
    } else {
      setSelectedAmenities(prev =>
        prev.includes(amenity)
          ? prev.filter(a => a !== amenity)
          : [...prev, amenity]
      );
    }
  };

  const onAddSubmit = async (data) => {
    if (selectedAmenities.length === 0) {
      toast.error('يجب اختيار خدمة واحدة على الأقل');
      return;
    }

    try {
      let roomData = {
        ...data,
        amenities: selectedAmenities,
        pricePerNight: Number(data.pricePerNight),
      };

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        Object.keys(roomData).forEach(key => {
          if (Array.isArray(roomData[key])) {
            roomData[key].forEach(item => formData.append(key, item));
          } else {
            formData.append(key, roomData[key]);
          }
        });
        selectedFiles.forEach(file => formData.append('images', file));
        roomData = formData;
      }

      await addRoomMutation.mutateAsync(roomData);
      toast.success('تم إضافة الغرفة بنجاح');
      setIsAddModalOpen(false);
      resetAdd();
      setSelectedAmenities([]);
      setSelectedImages([]);
      setSelectedFiles([]);
    } catch (error) {
      toast.error(error.message || 'فشل في إضافة الغرفة');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined && value !== '')
      );

      if (editSelectedAmenities.length > 0) {
        payload.amenities = editSelectedAmenities;
      } else {
        payload.amenities = [];
      }

      if (editSelectedFiles.length > 0) {
        payload.images = editSelectedFiles;
      }

      if (payload.pricePerNight) {
        payload.pricePerNight = Number(payload.pricePerNight);
      }

      if (Object.keys(payload).length === 0) {
        toast.error('يرجى تعديل حقل واحد على الأقل قبل الحفظ');
        return;
      }

      let roomData = payload;

      if (editSelectedFiles.length > 0) {
        const formData = new FormData();
        Object.keys(roomData).forEach(key => {
          if (Array.isArray(roomData[key])) {
            roomData[key].forEach(item => formData.append(key, item));
          } else {
            formData.append(key, roomData[key]);
          }
        });
        editSelectedFiles.forEach(file => formData.append('images', file));
        roomData = formData;
      }

      await updateRoomMutation.mutateAsync({
        roomId: editingRoom.id,
        data: roomData,
      });
      toast.success('تم تحديث الغرفة بنجاح');
      setEditingRoom(null);
      resetEdit();
      setEditSelectedAmenities([]);
      setEditSelectedImages([]);
      setEditSelectedFiles([]);
    } catch (error) {
      toast.error(error.message || 'فشل في تحديث الغرفة');
    }
  };

  const handleDelete = async (roomId) => {
    const isConfirmed = await confirmDelete('هل أنت متأكد من حذف هذه الغرفة؟', 'لن تتمكن من استعادة هذه الغرفة!');
    if (isConfirmed) {
      try {
        await deleteRoomMutation.mutateAsync(roomId);
        toast.success('تم حذف الغرفة بنجاح');
      } catch (error) {
        toast.error(error.message || 'فشل في حذف الغرفة');
      }
    }
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setEditSelectedAmenities(room.amenities || []);
    setEditSelectedImages(room.images || []);
    setEditSelectedFiles([]);
    resetEdit({
      roomNumber: room.roomNumber,
      type: room.type,
      pricePerNight: room.pricePerNight,
      status: room.status,
      category: room.category,
    });
  };

  const columns = [
    {
      header: 'رقم الغرفة',
      key: 'roomNumber',
    },
    {
      header: 'النوع',
      key: 'type',
    },
    {
      header: 'السعر لليلة',
      render: (room) => `${room.pricePerNight} ريال`,
    },
    {
      header: 'الحالة',
      key: 'status',
    },
    {
      header: 'الفئة',
      key: 'category',
    },
    {
      header: 'الخدمات',
      render: (room) => room.amenities?.join(', ') || 'لا توجد',
    },
    {
      header: 'الإجراءات',
      render: (room) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setViewingRoom(room)}
            title="عرض التفاصيل"
          >
            <FiEye size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(room)}
          >
            <FiEdit2 size={16} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(room.id)}
            loading={deleteRoomMutation.isPending}
          >
            <FiTrash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">إدارة الغرف</h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            هنا يمكنك إضافة وتعديل وحذف غرف الفندق بسهولة. هذا القسم مخصص لإدارة جميع غرف الفندق بطريقة منظمة.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <FiPlus size={20} className="ml-2" />
          إضافة غرفة
        </Button>
      </div>

      <div className="rounded-[2rem] border border-gray-200/60 bg-white/90 shadow-sm p-5">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">قائمة الغرف</h2>
            <p className="text-sm text-gray-500">يمكنك البحث في القائمة وتعديل بيانات أي غرفة بسهولة.</p>
          </div>
        </div>
        <Table
          columns={columns}
          data={rooms}
          loading={isLoading}
          emptyMessage="لا توجد غرف"
        />
      </div>

      {/* Modal لإضافة غرفة */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => {
          setIsAddModalOpen(false);
          resetAdd();
          setSelectedAmenities([]);
          setSelectedImages([]);
          setSelectedFiles([]);
        }}
        title="إضافة غرفة جديدة"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم الغرفة
            </label>
            <input
              type="text"
              {...registerAdd('roomNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.roomNumber && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.roomNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              النوع
            </label>
            <select
              {...registerAdd('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">اختر النوع</option>
              <option value="فردية">فردية</option>
              <option value="مزدوجة">مزدوجة</option>
              <option value="جناح">جناح</option>
              <option value="عائلية">عائلية</option>
              <option value="أخرى">أخرى</option>
            </select>
            {errorsAdd.type && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              السعر لليلة
            </label>
            <input
              type="number"
              {...registerAdd('pricePerNight')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsAdd.pricePerNight && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.pricePerNight.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة
            </label>
            <select
              {...registerAdd('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="متاحة">متاحة</option>
              <option value="محجوز">محجوز</option>
              <option value="تحت الصيانة">تحت الصيانة</option>
            </select>
            {errorsAdd.status && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الفئة
            </label>
            <select
              {...registerAdd('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">اختر الفئة</option>
              <option value="اقتصادي">اقتصادي</option>
              <option value="فاخر">فاخر</option>
              <option value="رجال أعمال">رجال أعمال</option>
              <option value="جناح رئيسي">جناح رئيسي</option>
            </select>
            {errorsAdd.category && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الخدمات
            </label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesOptions.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="mr-2"
                  />
                  {amenity}
                </label>
              ))}
            </div>
            {errorsAdd.amenities && (
              <p className="mt-1 text-sm text-red-600">{errorsAdd.amenities.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الصور
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {selectedFiles.length > 0 && (
              <p className="mt-1 text-sm text-gray-600">{selectedFiles.length} ملف(ات) مختارة</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetAdd();
                setSelectedAmenities([]);
                setSelectedImages([]);
                setSelectedFiles([]);
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={addRoomMutation.isPending}>
              إضافة
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal لتعديل غرفة */}
      <Modal
        isOpen={!!editingRoom}
        onRequestClose={() => {
          setEditingRoom(null);
          resetEdit();
          setEditSelectedAmenities([]);
          setEditSelectedImages([]);
          setEditSelectedFiles([]);
        }}
        title="تعديل الغرفة"
        size="lg"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم الغرفة
            </label>
            <input
              type="text"
              {...registerEdit('roomNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.roomNumber && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.roomNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              النوع
            </label>
            <select
              {...registerEdit('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">اختر النوع</option>
              <option value="فردية">فردية</option>
              <option value="مزدوجة">مزدوجة</option>
              <option value="جناح">جناح</option>
              <option value="عائلية">عائلية</option>
              <option value="أخرى">أخرى</option>
            </select>
            {errorsEdit.type && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              السعر لليلة
            </label>
            <input
              type="number"
              {...registerEdit('pricePerNight')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorsEdit.pricePerNight && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.pricePerNight.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة
            </label>
            <select
              {...registerEdit('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">اختر الحالة</option>
              <option value="متاحة">متاحة</option>
              <option value="محجوز">محجوز</option>
              <option value="تحت الصيانة">تحت الصيانة</option>
            </select>
            {errorsEdit.status && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الفئة
            </label>
            <select
              {...registerEdit('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">اختر الفئة</option>
              <option value="اقتصادي">اقتصادي</option>
              <option value="فاخر">فاخر</option>
              <option value="رجال أعمال">رجال أعمال</option>
              <option value="جناح رئيسي">جناح رئيسي</option>
            </select>
            {errorsEdit.category && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الخدمات
            </label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesOptions.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editSelectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity, true)}
                    className="mr-2"
                  />
                  {amenity}
                </label>
              ))}
            </div>
            {errorsEdit.amenities && (
              <p className="mt-1 text-sm text-red-600">{errorsEdit.amenities.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الصور
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setEditSelectedFiles(Array.from(e.target.files))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {editSelectedFiles.length > 0 && (
              <p className="mt-1 text-sm text-gray-600">{editSelectedFiles.length} ملف(ات) مختارة</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingRoom(null);
                resetEdit();
                setEditSelectedAmenities([]);
                setEditSelectedImages([]);
                setEditSelectedFiles([]);
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" loading={updateRoomMutation.isPending}>
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>
      {/* Modal لعرض تفاصيل الغرفة */}
      <Modal
        isOpen={!!viewingRoom}
        onRequestClose={() => setViewingRoom(null)}
        title="تفاصيل الغرفة"
        size="lg"
      >
        {viewingRoom && (
          <div className="space-y-6">
            {/* صور الغرفة */}
            {viewingRoom.images && viewingRoom.images.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">الصور</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {viewingRoom.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={img}
                        alt={`صورة الغرفة ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/img/logo.jpg';
                          e.target.className = 'w-full h-full object-contain p-2';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* تفاصيل الغرفة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">رقم الغرفة</p>
                <p className="text-lg font-semibold text-gray-900">{viewingRoom.roomNumber}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">النوع</p>
                <p className="text-lg font-semibold text-gray-900">{viewingRoom.type}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">السعر لليلة</p>
                <p className="text-lg font-semibold text-primary">{viewingRoom.pricePerNight} ريال</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">الحالة</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  viewingRoom.status === 'متاحة'
                    ? 'bg-green-100 text-green-800'
                    : viewingRoom.status === 'محجوز'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {viewingRoom.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">الفئة</p>
                <p className="text-lg font-semibold text-gray-900">{viewingRoom.category}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">تاريخ الإنشاء</p>
                <p className="text-sm font-medium text-gray-900">
                  {viewingRoom.createdAt ? new Date(viewingRoom.createdAt).toLocaleString('ar-SA') : '-'}
                </p>
              </div>
            </div>

            {/* الخدمات */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">الخدمات المتوفرة</p>
              <div className="flex flex-wrap gap-2">
                {viewingRoom.amenities && viewingRoom.amenities.length > 0 ? (
                  viewingRoom.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                    >
                      {amenity}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">لا توجد خدمات</p>
                )}
              </div>
            </div>

            {/* معرف الغرفة */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">معرف الغرفة</p>
              <p className="text-sm font-mono text-gray-600 break-all">{viewingRoom.id || viewingRoom._id}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewingRoom(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoomsManagement;