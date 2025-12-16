import { useSiteData } from "@/contexts/SiteDataContext";
import FormsTab from "@/components/admin/tabs/FormsTab";

const FormsPage = () => {
    const { formConfigs, setFormConfigs } = useSiteData();

    return (
        <FormsTab />
    );
};

export default FormsPage;
