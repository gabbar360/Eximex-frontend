import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import BasicTableOne from '../../components/tables/BasicTables/BasicTableOne';

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="Tables - EximEx Dashboard"
        description="Data tables and listings for EximEx trading platform."
      />
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
