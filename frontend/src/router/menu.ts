import homeIcon from "@/assets/icon/home.svg"
import toolsIcon from "@/assets/icon/tools.svg"
import mappingIcon from "@/assets/icon/mapping.svg"

const MenuList = [
    {
      name: "aside.home",
      path: "/",
      icon: homeIcon,
    },
    {
      name: "aside.penetration",
      path: "/Permeation", // 为 views 文件夹下的一级目录名称
      icon: "Smoking", // 如果为字符串，使用是 element-plus 的图标名称，由于注册了全图标会自动加载
      children: [
        {
          name: "aside.webscan",
          path: "/Webscan", // 二级文件 .vue 的名称
          icon: "/app/webscan.png"
        },
        {
          name: "aside.portscan",
          path: "/Portscan",
          icon: "/app/portscan.png"
        },
        {
          name: "aside.crack",
          path: "/Crack",
          icon: "/app/target.png"
        },
        {
          name: "aside.dirscan",
          path: "/Dirsearch",
          icon: "/app/dirscan.png"
        },
        {
          name: "aside.jsfinder",
          path: "/JSFinder",
          icon: "/app/extract.png"
        },
        {
          name: "aside.exp",
          path: "/Exploitation",
          icon: "/app/attack.png"
        },
      ]
    },
    {
      name: "aside.asset_collection",
      path: "/Asset",
      icon: "OfficeBuilding",
      children: [
        {
          name: "aside.asset_from_company",
          path: "/Company",
          icon: "/app/company.png",
        },
        {
          name: "aside.subdomain_brute_force",
          path: "/Subdomain",
          icon: "/app/bomb.png"
        },
        {
          name: "aside.search_domain_info",
          path: "/Ipdomain",
          icon: "/app/domain.png"
        },
        {
          name: "aside.isic",
          path: "/ISICollection",
          icon: "/app/internet.png"
        },
      ]
    },
    {
      name: "aside.space_engine",
      path: "/SpaceEngine",
      icon: mappingIcon,
      children: [
        {
          name: "aside.fofa",
          path: "/FOFA",
          icon: "/app/fofa.ico"
        },
        {
          name: "aside.hunter",
          path: "/Hunter",
          icon: "/app/hunter.ico"
        },
        {
          name: "aside.360quake",
          path: "/Quake",
          icon: "/app/360.png"
        },
        {
          name: "aside.polymerization",
          path: "/Polymerization",
          icon: "/app/polymerization.png"
        },
        {
          name: "aside.agent_pool",
          path: "/AgentPool",
          icon: "/app/pool.png"
        },
      ]
    },
    {
      name: "aside.tools",
      path: "/Tools",
      icon: toolsIcon,
      children: [
        {
          name: "aside.en_and_de",
          path: "/Codec",
          icon: "/app/encrypt.png"
        },
        {
          name: "aside.systeminfo",
          path: "/System",
          icon: "/app/virus.png"
        },
        {
          name: "aside.data_handing",
          path: "/DataHanding",
          icon: "/app/data.png"
        },
        {
          name: "aside.memorandum",
          path: "/Memo",
          icon: "/app/memo.png"
        },
        {
          name: "aside.reverse",
          path: "/Reverse",
          icon: "/app/skull.png"
        },
        {
          name: "aside.associate_dictionary_generator",
          path: "/Thinkdict",
          icon: "/app/dict.png"
        },
        {
          name: "aside.aksk",
          path: "/AKSK",
          icon: "/app/wechat.png"
        },
        {
          name: "aside.extract_database_info",
          path: "/ExtractDbInfo",
          icon: "/app/database.png"
        },
      ]
    },
  ]

  export default MenuList