import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Archive, RotateCcw, Edit2, Layers } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useToggleArchiveCategory } from '../hooks/useCategories';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { currency } from '../utils/formatters';

const categorySurfaces = [
  { card: 'from-white to-primary-50/90 border-primary-100/80', pill: 'bg-primary-50 text-primary-700' },
  { card: 'from-white to-emerald-50/90 border-emerald-100/80', pill: 'bg-emerald-50 text-emerald-700' },
  { card: 'from-white to-amber-50/90 border-amber-100/80', pill: 'bg-amber-50 text-amber-700' },
  { card: 'from-white to-rose-50/90 border-rose-100/80', pill: 'bg-rose-50 text-rose-700' },
  { card: 'from-white to-cyan-50/90 border-cyan-100/80', pill: 'bg-cyan-50 text-cyan-700' },
  { card: 'from-white to-violet-50/90 border-violet-100/80', pill: 'bg-violet-50 text-violet-700' },
];

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  defaultPurchasePrice: z.coerce.number().min(0).optional().default(0),
  description: z.string().optional().default(''),
});

export default function Categories() {
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: categories, isLoading, isError, refetch } = useCategories({ archived: showArchived ? 'true' : undefined });
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const archiveMut = useToggleArchiveCategory();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', defaultPurchasePrice: 0, description: '' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    reset({ name: cat.name, defaultPurchasePrice: cat.defaultPurchasePrice, description: cat.description });
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editing) {
      updateMut.mutate({ id: editing._id, data }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMut.mutate(data, { onSuccess: () => { setModalOpen(false); reset(); } });
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (isError) {
    return (
      <ErrorState
        title="Categories unavailable"
        description="We couldn't load your category list."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-white to-primary-50 p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">Catalog</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Organize your subscription categories.</h1>
            <p className="mt-1 text-sm text-slate-500">
              Keep default purchase prices ready so new sales can be entered faster on mobile and desktop.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowArchived(!showArchived)}>
              {showArchived ? 'Active' : 'Archived'}
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>

      {!categories?.length ? (
        <EmptyState icon={Layers} title="No categories yet" description="Create your first subscription category to get started.">
          <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Category</Button>
        </EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => {
            const palette = categorySurfaces[index % categorySurfaces.length];
            return (
              <Card key={cat._id} className={`overflow-hidden border bg-gradient-to-br ${palette.card}`}>
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${palette.pill}`}>
                        Seller category
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-slate-900">{cat.name}</h3>
                      {cat.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{cat.description}</p>}
                      <p className="mt-4 text-sm text-slate-600">
                        Default Price: <span className="font-semibold text-slate-900">{currency(cat.defaultPurchasePrice)}</span>
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(cat)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => archiveMut.mutate(cat._id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        {cat.isArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" placeholder="e.g. Netflix" error={errors.name?.message} {...register('name')} />
          <Input label="Default Purchase Price" type="number" step="0.01" error={errors.defaultPurchasePrice?.message} {...register('defaultPurchasePrice')} />
          <Textarea label="Description" placeholder="Optional description" error={errors.description?.message} {...register('description')} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
