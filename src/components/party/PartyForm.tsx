import React from 'react';
import { Formik, Form, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import Input from '../form/input/InputField';
import Select from '../form/Select';
import Label from '../form/Label';
import Checkbox from '../form/input/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import {
  addParty,
  updateParty,
  clearMessages,
} from '../../features/partySlice';

interface Party {
  id?: number;
  companyName: string;
  role: 'customer' | 'supplier';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  currency: string;
  tags: string;
  notes: string;
  status: boolean;
}

interface PartyFormProps {
  initial?: Party;
  onCancel: () => void;
}

const defaultForm: Party = {
  companyName: '',
  role: 'customer',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  currency: 'USD',
  tags: '',
  notes: '',
  status: true,
};

const roleOptions = [
  { value: 'customer', label: 'Customer' },
  { value: 'supplier', label: 'Supplier' },
];
const currencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'INR', label: 'INR' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const schema = Yup.object({
  companyName: Yup.string().required('Required'),
  role: Yup.string().oneOf(['customer', 'supplier']).required(),
  contactPerson: Yup.string(),
  email: Yup.string().email('Invalid email'),
  phone: Yup.string().matches(/^[\d+\-()\s]*$/, 'Invalid phone number'),
  pincode: Yup.string(),
  tags: Yup.string(),
  notes: Yup.string(),
  currency: Yup.string().required(),
  status: Yup.boolean(),
});

const PartyForm: React.FC<PartyFormProps> = ({
  initial = defaultForm,
  onCancel,
}) => {
  const dispatch = useDispatch<(action: any) => Promise<any>>();
  const { loading, error, successMessage } = useSelector(
    (state: any) => state.party
  );

  const handleSubmit = async (
    values: Party,
    { setSubmitting, setStatus }: FormikHelpers<Party>
  ) => {
    setStatus({});
    setSubmitting(true);
    try {
      if (initial && initial.id) {
        // Edit
        console.log('Submitting update for party ID:', initial.id);
        console.log('Update values:', values);

        const resultAction = await dispatch(
          updateParty({
            id: initial.id as number,
            party: values,
          })
        );

        console.log('Update result action:', resultAction);

        if (!resultAction.error) {
          const message =
            resultAction.payload?.message || 'Party updated successfully';
          setStatus({ success: message });
          setTimeout(() => onCancel(), 1000);
        } else {
          console.error('Update error:', resultAction.error);
          setStatus({ error: resultAction.error.message || 'Update failed' });
        }
      } else {
        // Add
        console.log('Submitting new party:', values);

        const resultAction = await dispatch(addParty(values));

        console.log('Add result action:', resultAction);

        if (!resultAction.error) {
          const message =
            resultAction.payload?.message || 'Party added successfully';
          setStatus({ success: message });
          setTimeout(() => onCancel(), 1000);
        } else {
          console.error('Add error:', resultAction.error);
          setStatus({ error: resultAction.error.message || 'Add failed' });
        }
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      setStatus({ error: err.message || 'Something went wrong' });
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {initial.id ? 'Edit Party' : 'Add New Party'}
        </h2>
      </div>
      <Formik
        initialValues={initial}
        enableReinitialize
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({
          isSubmitting,
          status,
          values,
          setFieldValue,
          handleChange,
          touched,
          errors,
        }: FormikProps<Party> & {
          status?: { success?: string; error?: string };
        }) => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="col-span-1">
                <Label htmlFor="companyName" className="dark:text-white">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Global Tiles LLC"
                  value={values.companyName}
                  onChange={handleChange}
                  error={!!touched.companyName && !!errors.companyName}
                  hint={touched.companyName ? errors.companyName : undefined}
                  className="bg-white dark:bg-[#161e2e] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                />
              </div>
              {/* Contact Person */}
              <div className="col-span-1">
                <Label htmlFor="contactPerson" className="dark:text-white">
                  Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  placeholder="John Doe"
                  value={values.contactPerson}
                  onChange={handleChange}
                  className="bg-white dark:bg-[#161e2e] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                />
              </div>
              {/* Role */}
              <div className="col-span-1">
                <Label htmlFor="role" className="dark:text-white">
                  Role
                </Label>
                <Select
                  options={roleOptions}
                  defaultValue={values.role}
                  onChange={(val) => setFieldValue('role', val)}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* Phone */}
              <div className="col-span-1">
                <Label htmlFor="phone" className="dark:text-white">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="+1 234 567 890"
                  value={values.phone}
                  onChange={handleChange}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* Email */}
              <div className="col-span-1">
                <Label htmlFor="email" className="dark:text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@globaltiles.com"
                  value={values.email}
                  onChange={handleChange}
                  error={!!touched.email && !!errors.email}
                  hint={touched.email ? errors.email : undefined}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* Address */}
              <div className="col-span-1">
                <Label htmlFor="address" className="dark:text-white">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Ocean Avenue"
                  value={values.address}
                  onChange={handleChange}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* City */}
              <div className="col-span-1">
                <Label htmlFor="city" className="dark:text-white">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Los Angeles"
                  value={values.city}
                  onChange={handleChange}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* State */}
              <div className="col-span-1">
                <Label htmlFor="state" className="dark:text-white">
                  State
                </Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="California"
                  value={values.state}
                  onChange={handleChange}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* Country */}
              <div className="col-span-1">
                <Label htmlFor="country" className="dark:text-white">
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  placeholder="USA"
                  value={values.country}
                  onChange={handleChange}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* Pincode */}
              <div className="col-span-1">
                <Label htmlFor="pincode" className="dark:text-white">
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  name="pincode"
                  type="text"
                  placeholder="90210"
                  value={values.pincode}
                  onChange={handleChange}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* Currency */}
              <div className="col-span-1">
                <Label htmlFor="currency" className="dark:text-white">
                  Currency
                </Label>
                <Select
                  options={currencyOptions}
                  defaultValue={values.currency}
                  onChange={(val) => setFieldValue('currency', val)}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* Tags */}
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="tags" className="dark:text-white">
                  Tags
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  type="text"
                  placeholder="retail, north_america"
                  value={values.tags}
                  onChange={handleChange}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* Notes */}
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="notes" className="dark:text-white">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  type="text"
                  placeholder="Additional information about this party"
                  value={values.notes}
                  onChange={handleChange}
                  className="bg-white dark:bg-boxdark border border-gray-300 dark:border-strokedark text-gray-900 dark:text-white"
                />
              </div>
              {/* Status Checkbox */}
              <div className="col-span-1 flex items-center gap-2 mt-2">
                <Checkbox
                  id="status"
                  checked={values.status}
                  onChange={(checked) => setFieldValue('status', checked)}
                  label="Active"
                  className="dark:text-white"
                />
              </div>
            </div>
            {/* Error/Success messages */}
            {status?.error && (
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-700 mt-4">
                {status.error}
              </div>
            )}
            {status?.success && (
              <div className="text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/30 p-2 rounded border border-green-200 dark:border-green-700 mt-4">
                {status.success}
              </div>
            )}
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-700 mt-4">
                {error}
              </div>
            )}
            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 mt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="px-4 py-2 border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isSubmitting || loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PartyForm;
