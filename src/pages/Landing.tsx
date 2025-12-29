import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Target, BarChart3, Radar, Sparkles, TrendingUp } from 'lucide-react';

export default function Landing() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    return (
        <div className="min-h-screen gradient-bg">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Navigation */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 glass border-0 border-b border-white/20"
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 font-bold text-xl text-white"
                    >
                        <Radar className="w-6 h-6 text-purple-300" />
                        Lead Radar
                    </motion.div>
                    <div className="flex items-center gap-6">
                        <Link
                            to="/login"
                            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                        >
                            Log in
                        </Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                to="/signup"
                                className="btn-primary px-6 py-2.5 rounded-xl text-white font-medium text-sm flex items-center gap-2"
                            >
                                Get Started
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    <motion.div className="space-y-4">
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-white/90 text-sm font-medium mb-6"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            AI-Powered Lead Discovery
                        </motion.div>
                        <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                            Find founders who
                            <br />
                            <span className="gradient-text bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                                just launched
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
                    >
                        Discover high-intent leads from Product Hunt, Indie Hackers, and GitHub.
                        <br />
                        Score them automatically. Close more deals.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                to="/signup"
                                className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center gap-3 shadow-2xl"
                            >
                                Start for free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-white/60 text-sm flex items-center gap-2"
                        >
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white/20"></div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white/20"></div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-400 border-2 border-white/20"></div>
                            </div>
                            Join 1,000+ founders
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Floating dashboard preview */}
                <motion.div
                    animate="animate"
                    className="mt-20 relative"
                >
                    <div className="glass rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl">
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                                <div className="h-4 bg-white/15 rounded w-1/2"></div>
                                <div className="h-4 bg-white/10 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Everything you need to
                        <span className="gradient-text bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent"> scale</span>
                    </h2>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                        Powerful features designed to help you find and convert high-quality leads
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Radar,
                            title: "Multi-source scanning",
                            description: "Automatically pull leads from Product Hunt, Indie Hackers, and GitHub trending repos.",
                            color: "from-orange-400 to-red-400",
                        },
                        {
                            icon: Target,
                            title: "Smart scoring",
                            description: "Each lead is scored based on launch recency, traction, and marketing signals.",
                            color: "from-blue-400 to-purple-400",
                        },
                        {
                            icon: BarChart3,
                            title: "Pipeline CRM",
                            description: "Track your outreach with simple status updates. New → Contacted → Replied → Won.",
                            color: "from-green-400 to-blue-400",
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10 }}
                            className="card-hover glass rounded-2xl p-8 text-center group"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}
                            >
                                <feature.icon className="w-8 h-8 text-white" />
                            </motion.div>
                            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-white/70 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How it works</h2>
                    <p className="text-xl text-white/70">Simple, powerful, effective</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-12 text-center">
                    {[
                        {
                            step: "1",
                            title: "Sync sources",
                            description: "Click sync to pull the latest launches from all sources.",
                            icon: Zap,
                        },
                        {
                            step: "2",
                            title: "Filter high-intent",
                            description: "Focus on leads with 70+ score — they need your help most.",
                            icon: Target,
                        },
                        {
                            step: "3",
                            title: "Reach out",
                            description: "Contact founders directly via Twitter or their website.",
                            icon: TrendingUp,
                        },
                    ].map((step, index) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="glass rounded-2xl p-8 h-full"
                            >
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                                        {step.step}
                                    </div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute -top-2 -right-2"
                                    >
                                        <step.icon className="w-6 h-6 text-purple-300" />
                                    </motion.div>
                                </div>
                                                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-white/70 leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="glass rounded-3xl p-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Start finding high-intent founders today
                    </h2>
                    <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
                        Stop guessing. Let Lead Radar surface founders who just launched
                        and actually need help.
                    </p>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block"
                    >
                        <Link
                            to="/signup"
                            className="btn-primary px-10 py-5 rounded-xl text-white font-semibold text-lg flex items-center gap-3 mx-auto"
                        >
                            Get started free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
}

